import React, { createContext, useContext, useEffect, useState } from 'react'
import { useMutation, useApolloClient } from './apollo'
import gql from 'graphql-tag'

const { DEBUG_RERENDERS, preventInfinityLoop, getContextIndependentWrappedInitialProps } = require('./_utils')

/**
 * AuthContext
 * -----------
 * This is the base react context instance. It should not be used
 * directly but is exported here to simplify testing.
 */
const AuthContext = createContext({
    isAuthenticated: false,
    isLoading: true,
    signin: () => {throw new Error('no Auth.signin')},
    signout: () => {throw new Error('no Auth.signin')},
    user: {},
})

/**
 * useAuth
 * -------
 * A hook which provides access to the AuthContext
 */
const useAuth = () => useContext(AuthContext)

const userFragment = `
  id
  name
  avatar {
    publicUrl
  }
  isAdmin
`

let USER_QUERY = gql`
    query {
        authenticatedUser {
            ${userFragment}
        }
    }
`

let SIGNIN_MUTATION = gql`
    mutation signin($email: String, $password: String) {
        authenticateUserWithPassword(email: $email, password: $password) {
            item {
                ${userFragment}
            }
        }
    }
`

let SIGNOUT_MUTATION = gql`
    mutation {
        unauthenticateUser {
            success
        }
    }
`

/**
 * AuthProvider
 * ------------
 * AuthProvider is a component which keeps track of the user's
 * authenticated state and provides methods for managing the auth state.
 */
const AuthProvider = ({ children, initialUserValue }) => {
    const client = useApolloClient()
    const [user, setUser] = useState(initialUserValue || null)

    useEffect(() => {
        // validate current user state without avoidable useQuery re-renders
        client.query({ query: USER_QUERY }).then(({ data: { authenticatedUser, error } }) => {
            if (error) { return onError(error) }
            if (JSON.stringify(authenticatedUser) === JSON.stringify(user)) return
            if (DEBUG_RERENDERS) console.log('AuthProvider() newUser', authenticatedUser)
            setUser(authenticatedUser)
        }, onError)
    }, [user])

    const [signin] = useMutation(SIGNIN_MUTATION, {
        onCompleted: async ({ authenticateUserWithPassword: { item } = {}, error }) => {
            if (error) { return onError(error) }
            if (DEBUG_RERENDERS) console.log('AuthProvider() signin()')

            // Ensure there's no old unauthenticated data hanging around
            await client.resetStore()

            if (item) {
                setUser(item)
            }
        },
        onError,
    })

    const [signout] = useMutation(SIGNOUT_MUTATION, {
        onCompleted: async ({ unauthenticateUser: { success } = {}, error }) => {
            if (error) { return onError(error) }
            if (DEBUG_RERENDERS) console.log('AuthProvider() signout()')

            // Ensure there's no old authenticated data hanging around
            await client.resetStore()

            if (success) {
                setUser(null)
            }
        },
        onError,
    })

    function onError (error) {
        console.error(error)
        setUser(null)
    }

    if (DEBUG_RERENDERS) console.log('AuthProvider()', user)

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!user,
                signin,
                signout,
                user,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

if (DEBUG_RERENDERS) AuthProvider.whyDidYouRender = true

const withAuth = ({ ssr = false, ...opts } = {}) => PageComponent => {
    // TODO(pahaz): refactor it. No need to patch globals here!
    USER_QUERY = opts.USER_QUERY ? opts.USER_QUERY : USER_QUERY
    SIGNIN_MUTATION = opts.SIGNIN_MUTATION ? opts.SIGNIN_MUTATION : SIGNIN_MUTATION
    SIGNOUT_MUTATION = opts.SIGNOUT_MUTATION ? opts.SIGNOUT_MUTATION : SIGNOUT_MUTATION

    const WithAuth = ({ user, ...pageProps }) => {
        if (DEBUG_RERENDERS) console.log('WithAuth()', user)
        return (
            <AuthProvider initialUserValue={user}>
                <PageComponent {...pageProps} />
            </AuthProvider>
        )
    }

    if (DEBUG_RERENDERS) WithAuth.whyDidYouRender = true

    // Set the correct displayName in development
    if (process.env.NODE_ENV !== 'production') {
        const displayName = PageComponent.displayName || PageComponent.name || 'Component'
        WithAuth.displayName = `withAuth(${displayName})`
    }

    if (ssr || PageComponent.getInitialProps) {
        WithAuth.getInitialProps = async ctx => {
            const isOnServerSide = typeof window === 'undefined'
            const pageProps = await getContextIndependentWrappedInitialProps(PageComponent, ctx)

            let user
            if (isOnServerSide) {
                try {
                    const data = await ctx.apolloClient.query({
                        query: USER_QUERY,
                        fetchPolicy: 'network-only',
                    })
                    user = data.data ? data.data.authenticatedUser : undefined
                } catch (error) {
                    // Prevent Apollo Client GraphQL errors from crashing SSR.
                    // Handle them in components via the data.error prop:
                    // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
                    console.error('Error while running `withAuth`', error)
                }
            }

            preventInfinityLoop(ctx)

            return {
                ...pageProps,
                user,
            }
        }
    }

    return WithAuth
}

export {
    withAuth,
    useAuth,
}
