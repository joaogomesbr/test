/**
 * Generated by `createschema user.User name:Text; password?:Password; isAdmin?:Checkbox; email?:Text; isEmailVerified?:Checkbox; phone?:Text; isPhoneVerified?:Checkbox; avatar?:File; meta:Json; importId:Text;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { gql } = require('graphql-tag')

const { generateGqlQueries } = require('@condo/domains/common/utils/codegeneration/generate.gql')

const COMMON_FIELDS = 'id dv sender v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const USER_FIELDS = `{ name avatar { publicUrl } meta importId ${COMMON_FIELDS} }`
const User = generateGqlQueries('User', USER_FIELDS)
const UserAdmin = generateGqlQueries('User', '{ id isAdmin email isEmailVerified phone isPhoneVerified }')

const REGISTER_NEW_USER_MUTATION = gql`
    mutation registerNewUser($data: RegisterNewUserInput!) {
        user: registerNewUser(data: $data) ${USER_FIELDS}
    }
`

const GET_MY_USERINFO = gql`
    query getUser {
        user: authenticatedUser ${USER_FIELDS}
    }
`

const SIGNIN_MUTATION = gql`
    mutation sigin($identity: String, $secret: String) {
        auth: authenticateUserWithPassword(email: $identity, password: $secret) {
            user: item ${USER_FIELDS}
        }
    }
`

const CHANGE_PASSWORD_WITH_TOKEN_MUTATION = gql`
    mutation changePasswordWithToken($token: String!, $password: String!) {
        status: changePasswordWithToken(token: $token, password: $password)
    }
`

const SIGNIN_BY_PHONE_AND_PASSWORD_MUTATION = gql`
    mutation authenticateUserWithPhoneAndPassword ($phone: String!, $password: String!) {
        obj: authenticateUserWithPhoneAndPassword(data: { phone: $phone, password: $password }) {
            item {
                id
            }
        }
    }
` 
const START_PASSWORD_RECOVERY_MUTATION = gql`
    mutation startPasswordRecovery($email: String!, $dv: Int!, $sender: JSON!){
        status: startPasswordRecovery(email: $email, dv: $dv, sender: $sender)
    }
`

const START_CONFIRM_PHONE_MUTATION = gql`
    mutation startConfirmPhoneAction($phone: String!, $dv: Int!, $sender: JSON!) {
        token: startConfirmPhoneAction(phone: $phone, dv: $dv, sender: $sender)
    }
`
const RESEND_CONFIRM_PHONE_SMS_MUTATION = gql`
    mutation confirmPhoneActionResendSms($token: String!) {
        status: confirmPhoneResendSms(token: $token)
    }
`
const COMPLETE_CONFIRM_PHONE_MUTATION = gql`
    mutation confirmPhoneActionComplete($token: String!, $smsCode: Int!) {
        phone: confirmPhoneActionComplete(token: $token, smsCode: $smsCode)
    }
`
const GET_PHONE_BY_CONFIRM_PHONE_TOKEN_QUERY = gql`
    query getPhoneByConfirmPhoneActionToken($token: String!) {
        phone: getPhoneByConfirmPhoneActionToken(token: $token)
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    User,
    UserAdmin,
    REGISTER_NEW_USER_MUTATION,
    GET_MY_USERINFO,
    SIGNIN_MUTATION,
    CHANGE_PASSWORD_WITH_TOKEN_MUTATION,
    SIGNIN_BY_PHONE_AND_PASSWORD_MUTATION,
    START_PASSWORD_RECOVERY_MUTATION,    
    START_CONFIRM_PHONE_MUTATION,
    RESEND_CONFIRM_PHONE_SMS_MUTATION,
    COMPLETE_CONFIRM_PHONE_MUTATION,
    GET_PHONE_BY_CONFIRM_PHONE_TOKEN_QUERY,
/* AUTOGENERATE MARKER <EXPORTS> */
}
