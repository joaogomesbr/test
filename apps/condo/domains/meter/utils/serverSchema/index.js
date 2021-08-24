/**
 * Generated by `createschema meter.MeterResource 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateServerUtils, execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const { MeterResource: MeterResourceGQL } = require('@condo/domains/meter/gql')
const { Meter: MeterGQL } = require('@condo/domains/meter/gql')
const { MeterStatus: MeterStatusGQL } = require('@condo/domains/meter/gql')
const { MeterSource: MeterSourceGQL } = require('@condo/domains/meter/gql')
const { MeterReading: MeterReadingGQL } = require('@condo/domains/meter/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const MeterResource = generateServerUtils(MeterResourceGQL)
const Meter = generateServerUtils(MeterGQL)
const MeterStatus = generateServerUtils(MeterStatusGQL)
const MeterSource = generateServerUtils(MeterSourceGQL)
const MeterReading = generateServerUtils(MeterReadingGQL)
/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    MeterResource,
    Meter,
    MeterStatus,
    MeterSource,
    MeterReading,
/* AUTOGENERATE MARKER <EXPORTS> */
}
