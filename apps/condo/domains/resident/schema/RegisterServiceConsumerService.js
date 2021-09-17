/**
 * Generated by `createservice resident.RegisterServiceConsumerService --type mutations`
 */

const { getById, GQLCustomSchema } = require('@core/keystone/schema')
const access = require('@condo/domains/resident/access/RegisterServiceConsumerService')
const { Organization } = require('@condo/domains/organization/utils/serverSchema')
const { BillingIntegrationOrganizationContext, BillingAccount } = require('@condo/domains/billing/utils/serverSchema')
const { ServiceConsumer, Resident } = require('../utils/serverSchema')
const { NOT_FOUND_ERROR, REQUIRED_NO_VALUE_ERROR } = require('@condo/domains/common/constants/errors')


async function getAccountsFromOrganizationIntegration (context, resident, unitName, accountNumber) {
    const [userOrganization] = await Organization.getAll(context, { id : resident.organization.id })
    if (!userOrganization) {
        throw new Error(`${NOT_FOUND_ERROR}organization] Organization not found for this user`)
    }

    const billingContexts = await BillingIntegrationOrganizationContext.getAll(context, { organization: { id: resident.organization.id } })
    const billingContext = billingContexts[0]
    if (!billingContext) {
        throw new Error(`${NOT_FOUND_ERROR}context] BillingIntegrationOrganizationContext not found for this user`)
    }

    let applicableBillingAccounts = await BillingAccount.getAll(context, {
        context: { id: billingContext.id },
        unitName: unitName,
    })
    if (!Array.isArray(applicableBillingAccounts)) {
        return [] // No accounts are found for this user
    }

    applicableBillingAccounts = applicableBillingAccounts.filter(
        (billingAccount) => {
            return accountNumber === billingAccount.number || accountNumber === billingAccount.globalId
        }
    )

    return applicableBillingAccounts
}


const RegisterServiceConsumerService = new GQLCustomSchema('RegisterServiceConsumerService', {
    types: [
        {
            access: true,
            type: 'input RegisterServiceConsumerInput { dv: Int!, sender: SenderFieldInput!, residentId: ID!, unitName: String!, accountNumber: String! }',
        },
    ],

    mutations: [
        {
            schemaDoc: 'This mutation tries to create service consumer',
            access: access.canRegisterServiceConsumer,
            schema: 'registerServiceConsumer(data: RegisterServiceConsumerInput!): ServiceConsumer',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data: { dv, sender, residentId, unitName, accountNumber } } = args

                if (!unitName || unitName.length === 0) { throw new Error(`${REQUIRED_NO_VALUE_ERROR}unitName] Unit name null or empty: ${unitName}`) }

                if (!accountNumber || accountNumber.length === 0) { throw new Error(`${REQUIRED_NO_VALUE_ERROR}accountNumber] Account number null or empty: ${accountNumber}`) }

                const [resident] = await Resident.getAll(context, { id: residentId })
                if (!resident) {
                    throw new Error(`${NOT_FOUND_ERROR}resident] Resident not found for this user`)
                }

                let applicableBillingAccounts

                // todo(toplenboren) remove this once B2C integration case is ready
                if (resident.organization) {
                    applicableBillingAccounts = await getAccountsFromOrganizationIntegration(context, resident, unitName, accountNumber)
                }

                if (!Array.isArray(applicableBillingAccounts) || applicableBillingAccounts.length === 0) {
                    throw new Error(`${NOT_FOUND_ERROR}account] BillingAccounts not found for this user`)
                }

                const attrs = {
                    dv,
                    sender,
                    resident: { connect: { id: residentId } },
                    accountNumber: accountNumber,
                }

                // todo (toplenboren) learn what to do if there are a lot of applicable billing accounts
                attrs.billingAccount = { connect: { id: applicableBillingAccounts[0].id } }

                const serviceConsumer = await ServiceConsumer.create(context, attrs)

                // Hack that helps to resolve all subfields in result of this mutation
                return await getById('ServiceConsumer', serviceConsumer.id)
            },
        },
    ],
    
})

module.exports = {
    RegisterServiceConsumerService,
}
