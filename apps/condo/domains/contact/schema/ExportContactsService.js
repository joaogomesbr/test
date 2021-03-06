const { EMPTY_DATA_EXPORT_ERROR } = require('@condo/domains/common/constants/errors')
const { createExportFile } = require('@condo/domains/common/utils/createExportFile')
const access = require('@condo/domains/contact/access/ExportContactsService')
const { loadContactsForExcelExport } = require('@condo/domains/contact/utils/serverSchema')
const { GQLCustomSchema } = require('@core/keystone/schema')
const dayjs = require('dayjs')
const timezone = require('dayjs/plugin/timezone')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)
dayjs.extend(timezone)

const CONTACTS_EXPORT_TEMPLATE_PATH = './domains/contact/templates/ContactsExportTemplate.xlsx'

const ExportContactsService = new GQLCustomSchema('ExportContactsService', {
    types: [
        {
            access: true,
            type: 'input ExportContactsToExcelInput { where: ContactWhereInput!, sortBy: [SortContactsBy!] }',
        },
        {
            access: true,
            type: 'type ExportContactsToExcelOutput { status: String!, linkToFile: String! }',
        },
    ],
    queries: [
        {
            access: access.canExportContactsToExcel,
            schema: 'exportContactsToExcel(data: ExportContactsToExcelInput!): ExportContactsToExcelOutput',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { where, sortBy } = args.data
                const contacts = await loadContactsForExcelExport({ where, sortBy })
                if (contacts.length === 0) {
                    throw new Error(`${EMPTY_DATA_EXPORT_ERROR}] no contacts found to export`)
                }
                const excelRows = contacts.map(contact => {
                    return {
                        name: contact.name,
                        address: contact.property,
                        unitName: contact.unitName,
                        phone: contact.phone,
                        email: contact.email,
                    }
                })
                const linkToFile = await createExportFile({
                    fileName: `contacts_${dayjs().format('DD_MM')}.xlsx`,
                    templatePath: CONTACTS_EXPORT_TEMPLATE_PATH,
                    replaces: { contacts: excelRows },
                    meta: {
                        listkey: 'Contact',
                        id: contacts[0].id,
                    },
                })
                return { status: 'ok', linkToFile }
            },
        },
    ],
    mutations: [

    ],
})

module.exports = {
    ExportContactsService,
}
