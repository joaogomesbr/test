/**
 * Generated by `createservice billing.BillingReceiptsService --type queries`
 */

const { GQLCustomSchema } = require('@core/keystone/schema')
const access = require('@condo/domains/billing/access/GetBillingReceiptsForServiceConsumerService')


const GetBillingReceiptsForServiceConsumer = new GQLCustomSchema('GetBillingReceiptsForServiceConsumerService', {
    types: [
        {
            access: true,
            // TODO(codegen): write BillingReceiptsService input !
            type: 'input BillingReceiptsForServiceConsumerInput { dv: Int!, sender: JSON! }',
        },
        {
            access: true,
            // TODO(codegen): write BillingReceiptsService output !
            type: 'type BillingReceiptsForServiceConsumerOutput { id: String! }',
        },
    ],
    
    queries: [
        {
            access: access.canGetBillingReceiptsForServiceConsumer,
            schema: 'executeBillingReceiptsForServiceConsumer (data: BillingReceiptsForServiceConsumerInput!): BillingReceiptsForServiceConsumerOutput',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data } = args
                // TODO(codegen): write logic here
            },
        },
    ],
    
})

module.exports = {
    GetBillingReceiptsForServiceConsumer,
}
