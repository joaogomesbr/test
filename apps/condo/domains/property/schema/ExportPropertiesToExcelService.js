/**
 * Generated by `createservice property.ExportPropertiesToExcelService --type queries`
 */

const { GQLCustomSchema } = require('@core/keystone/schema')
const access = require('@condo/domains/property/access/ExportPropertiesToExcelService')
const { Property: PropertyAPI } = require('@condo/domains/property/utils/serverSchema')
const { EMPTY_DATA_EXPORT_ERROR } = require('@condo/domains/common/constants/errors')
const moment = require('moment')
const { createExportFile } = require('@condo/domains/common/utils/createExportFile')

// as we have limits in query we need to fetch all properties by chunks
const CHUNK_SIZE = 50

// TODO(zuch): use workers for export
const ExportPropertiesToExcelService = new GQLCustomSchema('ExportPropertiesToExcelService', {
    types: [
        { 
            access: true,
            type: 'input ExportPropertiesToExcelInput { where: PropertyWhereInput!, sortBy: [SortPropertiesBy!] }',
        },
        {
            access: true,
            type: 'type ExportPropertiesToExcelOutput { status: String!, linkToFile: String!  }',
        },
    ],
    
    queries: [
        {
            access: access.canExportPropertiesToExcel,
            schema: 'exportPropertiesToExcel (data: ExportPropertiesToExcelInput!): ExportPropertiesToExcelOutput',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { where, sortBy } = args.data
                let skip = 0
                let iterationsLimit = 1000
                let newchunk = []
                let allProperties = []
                do {
                    newchunk = await PropertyAPI.getAll(context, where, { sortBy, first: CHUNK_SIZE, skip: skip })
                    allProperties = allProperties.concat(newchunk)
                    skip += newchunk.length
                } while (--iterationsLimit > 0 && newchunk.length)
                if (allProperties.length === 0) {
                    throw new Error(`${EMPTY_DATA_EXPORT_ERROR}] empty export file`)
                }
                const excelRows = allProperties.map(property => {
                    return {
                        organization: property.organization.name,
                        address: property.address,
                        unitsCount: property.unitsCount,
                        ticketsClosed: property.ticketsClosed,
                        ticketsInWork: property.ticketsInWork,
                    }
                })
                const linkToFile = await createExportFile({
                    fileName: `properties_${moment().format('DD_MM')}.xlsx`,
                    templatePath: './domains/property/templates/PropertiesExportTemplate.xlsx',
                    replaces: { properties: excelRows },
                    meta: {
                        listkey: 'Property',
                        id: allProperties[0].id,
                    },
                })
                return { status: 'ok', linkToFile }
            },
        },
    ],
    
})

module.exports = {
    ExportPropertiesToExcelService,
}