/**
 * Generated by `createschema billing.BillingAccount 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; bindingId:Text; number:Text; unit:Text; raw:Json; meta:Json'`
 */

const { canReadBillingEntity } = require('../utils/accessSchema')
const { canManageBillingEntity } = require('../utils/accessSchema')

async function canReadBillingAccounts ({ authentication: { item: user } }) {
    return await canReadBillingEntity(user)
}

async function canManageBillingAccounts ({ authentication: { item: user }, operation, itemId }) {
    return await canManageBillingEntity(user, operation, itemId)
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBillingAccounts,
    canManageBillingAccounts,
}
