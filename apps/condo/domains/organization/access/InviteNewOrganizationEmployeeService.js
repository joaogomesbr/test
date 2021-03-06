const { get } = require('lodash')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { checkOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')

async function canInviteNewOrganizationEmployee ({ authentication: { item: user }, args, context }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true

    const organizationId = get(args, ['data', 'organization', 'id'])
    if (!organizationId) return false
    return await checkOrganizationPermission(context, user.id, organizationId, 'canManageEmployees')
}

module.exports = {
    canInviteNewOrganizationEmployee,
}
