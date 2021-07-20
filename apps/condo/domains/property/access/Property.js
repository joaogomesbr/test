/**
 * Generated by `createschema property.Property 'organization:Text; name:Text; address:Text; addressMeta:Json; type:Select:building,village; map?:Json'`
 */
const get = require('lodash/get')
const { getById } = require('@core/keystone/schema')
const { checkOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canReadProperties ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return {}
    return {
        organization: {
            OR: [
                { employees_some: { user: { id: user.id }, isBlocked: false, deletedAt: null } },
                { relatedOrganizations_some: { from: { employees_some: { user: { id: user.id }, isBlocked: false, deletedAt: null } } } },
            ],
        },
    }
}


async function canManageProperties ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    if (operation === 'create') {
        const organizationId = get(originalInput, ['organization', 'connect', 'id'])
        if (!organizationId) {
            return false
        }

        return await checkOrganizationPermission(user.id, organizationId, 'canManageProperties')
    } else if (operation === 'update') {
        if (!itemId) {
            return false
        }

        const property = await getById('Property', itemId)
        if (!property) {
            return false
        }

        const { organization: organizationId } = property

        return await checkOrganizationPermission(user.id, organizationId, 'canManageProperties')
    } 
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadProperties,
    canManageProperties,
}
