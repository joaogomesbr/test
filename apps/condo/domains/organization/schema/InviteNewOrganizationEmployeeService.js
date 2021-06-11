const passwordGenerator = require('generate-password')
const { GQLCustomSchema } = require('@core/keystone/schema')
const { REGISTER_NEW_USER_MUTATION } = require('@condo/domains/user/gql')
const { normalizePhone } = require('@condo/domains/common/utils/phone')
const { sendMessage } = require('@condo/domains/notification/utils/serverSchema')
const { PHONE_WRONG_FORMAT_ERROR } = require('@condo/domains/common/constants/errors')
const { Organization, OrganizationEmployee } = require('@condo/domains/organization/utils/serverSchema')
const { INVITE_NEW_EMPLOYEE_MESSAGE_TYPE } = require('@condo/domains/notification/constants')
const { createOrganizationEmployee } = require('../../../utils/serverSchema/Organization')
const { rules } = require('../../../access')
const guards = require('../utils/serverSchema/guards')
const { ALREADY_EXISTS_ERROR, NOT_FOUND_ERROR } = require('@condo/domains/common/constants/errors')
const get = require('lodash/get')
const { getById } = require('@core/keystone/schema')

const InviteNewOrganizationEmployeeService = new GQLCustomSchema('InviteNewOrganizationEmployeeService', {
    types: [
        {
            access: true,
            type: 'input InviteNewOrganizationEmployeeInput { dv: Int!, sender: JSON!, organization: OrganizationWhereUniqueInput!, email: String!, phone: String, name: String, role: OrganizationEmployeeWhereUniqueInput, position: String}',
        },
        {
            access: true,
            type: 'input ReInviteOrganizationEmployeeInput { dv: Int!, sender: JSON!, organization: OrganizationWhereUniqueInput!, email: String!, phone: String}',
        },
    ],
    mutations: [
        {
            access: rules.canInviteEmployee,
            schema: 'inviteNewOrganizationEmployee(data: InviteNewOrganizationEmployeeInput!): OrganizationEmployee',
            resolver: async (parent, args, context) => {
                if (!context.authedItem.id) throw new Error('[error] User is not authenticated')
                const { data } = args
                let { organization, email, phone, role, position, name, ...restData } = data
                phone = normalizePhone(phone)
                if (!phone) throw new Error(`${PHONE_WRONG_FORMAT_ERROR}phone] invalid format`)

                // TODO(pahaz): normalize email!

                let user = await guards.checkUserExistency(context, email, phone)
                const existedEmployee = await guards.checkEmployeeExistency(context, organization, email, phone, user)

                if (existedEmployee) {
                    const msg = `${ALREADY_EXISTS_ERROR}employee unique] User is already invited in the organization`
                    throw new Error(msg)
                }

                if (!user) {
                    const password = passwordGenerator.generate({
                        length: 8,
                        numbers: true,
                    })

                    const userAttributes = {
                        name,
                        email,
                        phone,
                        password,
                        ...restData,
                    }

                    const { data: registerData, errors: registerErrors } = await context.executeGraphQL({
                        query: REGISTER_NEW_USER_MUTATION,
                        variables: {
                            data: userAttributes,
                        },
                    })

                    if (registerErrors) {
                        const msg = '[error] Unable to register user'
                        throw new Error(msg)
                    }

                    user = registerData.user
                }

                const employee = await createOrganizationEmployee(context, {
                    user: { connect: { id: user.id } },
                    organization: { connect: { id: organization.id } },
                    ...role && { role: { connect: { id: role.id } } },
                    position,
                    email,
                    name,
                    phone,
                    ...restData,
                })

                const organizationCountry = get(organization, 'country', 'en')
                const organizationName = get(organization, 'name')

                await sendMessage(context, {
                    lang: organizationCountry,
                    to: {
                        user: {
                            id: user.id,
                        },
                    },
                    type: INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
                    meta: {
                        organizationName,
                        dv: 1,
                    },
                    sender: data.sender,
                })

                return await getById('OrganizationEmployee', employee.id)
            },
        },
        {
            access: rules.canInviteEmployee,
            schema: 'reInviteOrganizationEmployee(data: ReInviteOrganizationEmployeeInput!): OrganizationEmployee',
            resolver: async (parent, args, context) => {
                if (!context.authedItem.id) {
                    throw new Error('[error] User is not authenticated')
                }
                const { data } = args
                const { organization, email, sender } = data
                let { phone } = data
                phone = normalizePhone(phone)
                if (!phone) {
                    throw new Error(`${PHONE_WRONG_FORMAT_ERROR}phone] invalid format`)
                }

                const [employeeOrganization] = await Organization.getAll(context, { id: organization.id })

                if (!employeeOrganization) {
                    throw new Error('No organization found for OrganizationEmployeeRole')
                }

                const existedUser = await guards.checkUserExistency(context, email, phone)
                if (!existedUser) {
                    const msg = `${NOT_FOUND_ERROR}user undef] There is no user for employee`
                    throw new Error(msg)
                }

                const existedEmployee = await guards.checkEmployeeExistency(context, organization, email, phone, existedUser)
                if (!existedEmployee) {
                    const msg = `${NOT_FOUND_ERROR}employee undef] There is no employee found invited to organization`
                    throw new Error(msg)
                }

                if (get(existedEmployee, 'isAccepted')) {
                    const msg = `${ALREADY_EXISTS_ERROR}employee unique] User is already accepted organization invitation`
                    throw new Error(msg)
                }

                const organizationCountry = get(employeeOrganization, 'country', 'en')
                const organizationName = get(employeeOrganization, 'name')

                await sendMessage(context, {
                    lang: organizationCountry,
                    to: {
                        user: {
                            id: existedUser.id,
                        },
                    },
                    type: INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
                    meta: {
                        organizationName,
                        dv: 1,
                    },
                    sender: sender,
                })

                return await getById('OrganizationEmployee', existedEmployee.id)
            },
        },
    ],
})

module.exports = {
    InviteNewOrganizationEmployeeService,
}
