/**
 * Generated by `createschema property.Property 'organization:Text; name:Text; address:Text; addressMeta:Json; type:Select:building,village; map?:Json'`
 */
const get = require('lodash/get')
const { queryOrganizationEmployeeFromRelatedOrganizationFor } = require('@condo/domains/organization/utils/accessSchema')
const { queryOrganizationEmployeeFor } = require('@condo/domains/organization/utils/accessSchema')
const { getById } = require('@core/keystone/schema')
const { checkOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { Resident: ResidentServerUtils } = require('@condo/domains/resident/utils/serverSchema')
const { RESIDENT } = require('@condo/domains/user/constants/common')


async function canReadProperties ({ authentication: { item: user }, context }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return {}
    const userId = user.id
    if (user.type === RESIDENT) {
        const residents = await ResidentServerUtils.getAll(context, { user: { id: userId }})
        if (residents.length === 0) {
            return false
        }
        const properties = residents.map(resident => get(resident, ['property', 'id']))
        if (properties.length > 0) {
            return {
                id_in: properties,
            }
        }
        return false
    }
    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(userId),
                queryOrganizationEmployeeFromRelatedOrganizationFor(userId),
            ],
        },
    }
}

async function canManageProperties ({ authentication: { item: user }, originalInput, operation, itemId, context }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    if (operation === 'create') {
        const organizationId = get(originalInput, ['organization', 'connect', 'id'])
        if (!organizationId) {
            return false
        }

        return await checkOrganizationPermission(context, user.id, organizationId, 'canManageProperties')
    } else if (operation === 'update') {
        if (!itemId) {
            return false
        }

        const property = await getById('Property', itemId)
        if (!property) {
            return false
        }

        const { organization: organizationId } = property

        return await checkOrganizationPermission(context, user.id, organizationId, 'canManageProperties')
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
