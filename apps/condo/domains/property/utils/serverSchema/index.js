/**
 * Generated by `createschema property.Property 'organization:Text; name:Text; address:Text; addressMeta:Json; type:Select:building,village; map?:Json'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')
const { generateServerUtils } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const { Property: PropertyGQL } = require('@condo/domains/property/gql')

const { Resident: ResidentGQL } = require('@condo/domains/property/gql')
const { CHECK_PROPERTY_WITH_ADDRESS_EXIST_QUERY } = require('@condo/domains/property/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const Property = generateServerUtils(PropertyGQL)
const Resident = generateServerUtils(ResidentGQL)

async function checkPropertyWithAddressExist (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')

    return await execGqlWithoutAccess(context, {
        query: CHECK_PROPERTY_WITH_ADDRESS_EXIST_QUERY,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to checkPropertyWithAddressExist',
        dataPath: 'obj',
    })
}
/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    Property,
    Resident,
    checkPropertyWithAddressExist,
/* AUTOGENERATE MARKER <EXPORTS> */
}
