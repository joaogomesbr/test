/**
 * Generated by `createservice acquiring.RegisterMultiPaymentService`
 */
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { RESIDENT } = require('@condo/domains/user/constants/common')

async function canRegisterMultiPayment ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true
    return user.type === RESIDENT
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canRegisterMultiPayment,
}