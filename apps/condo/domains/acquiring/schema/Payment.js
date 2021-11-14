/**
 * Generated by `createschema acquiring.Payment 'amount:Decimal; currencyCode:Text; time:DateTimeUtc; accountNumber:Text; purpose?:Text; receipt:Relationship:BillingReceipt:PROTECT; multiPayment:Relationship:MultiPayment:PROTECT; context:Relationship:AcquiringIntegrationContext:PROTECT;' --force`
 */

const { Text, Relationship, DateTimeUtc, Select } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema, getById } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD, CURRENCY_CODE_FIELD, POSITIVE_MONEY_AMOUNT_FIELD, NON_NEGATIVE_MONEY_FIELD } = require('@condo/domains/common/schema/fields')
const { PERIOD_FIELD } = require('@condo/domains/billing/schema/fields/common')
const access = require('@condo/domains/acquiring/access/Payment')
const { DV_UNKNOWN_VERSION_ERROR } = require('@condo/domains/common/constants/errors')
const { hasDvAndSenderFields } = require('@condo/domains/common/utils/validation.utils')
const { ACQUIRING_CONTEXT_FIELD } = require('@condo/domains/acquiring/schema/fields/relations')
const {
    PAYMENT_NO_PAIRED_RECEIPT,
    PAYMENT_NO_PAIRED_FROZEN_RECEIPT,
    PAYMENT_CONTEXT_ORGANIZATION_NOT_MATCH,
    PAYMENT_NOT_ALLOWED_TRANSITION,
    PAYMENT_MISSING_REQUIRED_FIELDS,
    PAYMENT_FROZEN_FIELD_INCLUDED,
    PAYMENT_TOO_BIG_IMPLICIT_FEE,
    PAYMENT_NO_PAIRED_CONTEXT,
    PAYMENT_NO_SUPPORTED_CONTEXT,
} = require('@condo/domains/acquiring/constants/errors')
const {
    PAYMENT_STATUSES,
    PAYMENT_INIT_STATUS,
    PAYMENT_TRANSITIONS,
    PAYMENT_REQUIRED_FIELDS,
    PAYMENT_FROZEN_FIELDS,
} = require('@condo/domains/acquiring/constants/payment')
const { AcquiringIntegrationContext } = require('@condo/domains/acquiring/utils/serverSchema')
const get = require('lodash/get')
const Big = require('big.js')


const Payment = new GQLListSchema('Payment', {
    schemaDoc: 'Information about completed transaction from user to a specific organization',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        amount: {
            ...POSITIVE_MONEY_AMOUNT_FIELD,
            schemaDoc: 'Amount of money from MultiPayment.amountWithOutExplicitFee to pay for billing receipt',
            isRequired: true,
        },

        explicitFee: {
            ...NON_NEGATIVE_MONEY_FIELD,
            schemaDoc: 'Amount of money which payer pays on top of initial "amount"',
            isRequired: false,
        },

        implicitFee: {
            ...NON_NEGATIVE_MONEY_FIELD,
            schemaDoc: 'Amount of money which recipient pays from initial amount for transaction',
            isRequired: false,
            access: { read: access.canReadPaymentsSensitiveData },
            hooks: {
                validateInput: ({ resolvedData, addFieldValidationError, fieldPath, listKey, operation, existingItem }) => {
                    if (resolvedData.hasOwnProperty(fieldPath) && resolvedData[fieldPath] !== null) {
                        const parsedDecimal = Big(resolvedData[fieldPath])
                        if (parsedDecimal.lt(0)) {
                            addFieldValidationError(`[${listKey.toLowerCase()}:${fieldPath}:negative] Field "${fieldPath}" of "${listKey}" must be greater then 0`)
                        }
                        const amount = Big(operation === 'create' ? resolvedData['amount'] : existingItem['amount'])
                        const fee = Big(resolvedData[fieldPath])
                        if (fee.gt(amount)) {
                            addFieldValidationError(PAYMENT_TOO_BIG_IMPLICIT_FEE)
                        }
                    }
                },
            },
        },

        currencyCode: CURRENCY_CODE_FIELD,

        advancedAt: {
            schemaDoc: 'Time at which money was advanced to recipient\'s account',
            type: DateTimeUtc,
            isRequired: false,
        },

        accountNumber: {
            schemaDoc: 'Payer\'s account number',
            type: Text,
            isRequired: true,
        },

        period: PERIOD_FIELD,

        purpose: {
            schemaDoc: 'Purpose of payment. Mostly used as title such as "Payment by agreement №123"',
            type: Text,
            isRequired: false,
        },

        receipt: {
            schemaDoc: 'Link to a billing receipt that the user paid for. Can be null in cases of getting payments out of our system',
            type: Relationship,
            ref: 'BillingReceipt',
            isRequired: false,
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
            hooks: {
                validateInput: ({ resolvedData, addFieldValidationError, fieldPath }) => {
                    if (resolvedData[fieldPath] && !resolvedData['frozenReceipt']) {
                        addFieldValidationError(PAYMENT_NO_PAIRED_FROZEN_RECEIPT)
                    }
                },
            },
        },

        frozenReceipt: {
            schemaDoc: 'Frozen billing receipt, used to resolving conflicts',
            type: Json,
            isRequired: false,
            access: { read: access.canReadPaymentsSensitiveData },
            hooks: {
                validateInput: ({ resolvedData, addFieldValidationError, fieldPath }) => {
                    if (resolvedData[fieldPath] && !resolvedData['receipt']) {
                        addFieldValidationError(PAYMENT_NO_PAIRED_RECEIPT)
                    }
                },
            },
        },

        multiPayment: {
            schemaDoc: 'Link to a payment related MultiPayment. Required field to update, but initially created unlinked',
            type: Relationship,
            ref: 'MultiPayment.payments',
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
        },

        context: {
            ...ACQUIRING_CONTEXT_FIELD,
            isRequired: false,
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
            hooks: {
                validateInput: async ({ resolvedData, addFieldValidationError, fieldPath, existingItem, operation }) => {
                    if (resolvedData[fieldPath]) {
                        const context = await getById('AcquiringIntegrationContext', resolvedData[fieldPath])
                        // NOTE: CHECKS THAT CONTEXT EXIST AND NOT DELETED ARE DONE AUTOMATICALLY BEFORE
                        const organization = operation === 'create' ? get(resolvedData, 'organization') : existingItem.organization
                        if (context.organization !== organization) {
                            return addFieldValidationError(PAYMENT_CONTEXT_ORGANIZATION_NOT_MATCH)
                        }
                    }
                },
            },
        },

        organization: {
            schemaDoc: 'Direct link to organization, since acquiring context cannot be defined for some payments',
            type: Relationship,
            ref: 'Organization',
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
            access: { read: access.canReadPaymentsSensitiveData },
        },

        status: {
            schemaDoc: `Status of payment. Can be: ${PAYMENT_STATUSES.map(status => `"${status}"`).join(', ')}`,
            type: Select,
            dataType: 'string',
            isRequired: true,
            options: PAYMENT_STATUSES,
            defaultValue: PAYMENT_INIT_STATUS,
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadPayments,
        create: access.canManagePayments,
        update: access.canManagePayments,
        delete: false,
        auth: true,
    },
    hooks: {
        validateInput: async ({ resolvedData, context, addValidationError, operation, existingItem }) => {
            if (!hasDvAndSenderFields(resolvedData, context, addValidationError )) return
            const { dv } = resolvedData
            if (dv === 1) {
                // NOTE: version 1 specific translations. Don't optimize this logic
            } else {
                return addValidationError(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown \`dv\``)
            }
            if (operation === 'create') {
                if (resolvedData['receipt']) {
                    if (!resolvedData['context']) {
                        return addValidationError(PAYMENT_NO_PAIRED_CONTEXT)
                    }
                    const receipt = await getById('BillingReceipt', resolvedData['receipt'])
                    const billingContext = await getById('BillingIntegrationOrganizationContext', receipt.context)
                    const acquiringContexts = await AcquiringIntegrationContext.getAll(context, {
                        id: resolvedData['context'],
                        integration: {
                            supportedBillingIntegrations_some: {
                                id: billingContext.integration,
                            },
                        },
                        organization: { id: resolvedData['organization'] },
                    })
                    if (!acquiringContexts.length) {
                        return addValidationError(PAYMENT_NO_SUPPORTED_CONTEXT)
                    }
                }
            } else if (operation === 'update') {
                const oldStatus = existingItem.status
                const newStatus = get(resolvedData, 'status', oldStatus)
                if (!PAYMENT_TRANSITIONS[oldStatus].includes(newStatus)) {
                    return addValidationError(`${PAYMENT_NOT_ALLOWED_TRANSITION} Cannot move from "${oldStatus}" status to "${newStatus}"`)
                }
                const newItem = {
                    ...existingItem,
                    ...resolvedData,
                }
                const requiredFields = PAYMENT_REQUIRED_FIELDS[newStatus]
                let requiredMissing = false
                for (const field of requiredFields) {
                    if (!newItem.hasOwnProperty(field) || newItem[field] === null) {
                        addValidationError(`${PAYMENT_MISSING_REQUIRED_FIELDS} Field ${field} was not provided`)
                        requiredMissing = true
                    }
                }
                if (requiredMissing) return
                const frozenFields = PAYMENT_FROZEN_FIELDS[oldStatus]
                for (const field of frozenFields) {
                    if (resolvedData.hasOwnProperty(field)) {
                        addValidationError(`${PAYMENT_FROZEN_FIELD_INCLUDED} (${field})`)
                    }
                }
            }
        },
    },
})

module.exports = {
    Payment,
}
