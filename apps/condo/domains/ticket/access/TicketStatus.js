/**
 * Generated by `createschema ticket.TicketStatus 'organization?:Relationship:Organization:CASCADE; type:Select:neworreopened,processing,canceled,completed,deferred,closed; name:Text;' --force`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canReadTicketStatuses ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin || user.isSupport) return true
    return {}
}

async function canManageTicketStatuses ({ authentication: { item: user }, operation }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    if (operation === 'create') {
        return false
    } else if (operation === 'update') {
        return false
    }
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTicketStatuses,
    canManageTicketStatuses,
}
