/**
 * Generated by `createschema organization.OrganizationLinkEmployeeAccess 'link:Relationship:OrganizationLink:CASCADE; employee:Relationship:OrganizationEmployee:CASCADE; canManageEmployees:Checkbox; canManageRoles:Checkbox; canManageIntegrations:Checkbox; canManageProperties:Checkbox; canManageTickets:Checkbox;'`
 */

const { Text, Relationship, Integer, Select, Checkbox, DateTimeUtc, CalendarDay, Decimal, Password, File } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/organization/access/OrganizationLinkEmployeeAccess')


const OrganizationLinkEmployeeAccess = new GQLListSchema('OrganizationLinkEmployeeAccess', {
    schemaDoc: 'Organization employee "from" access rights for managing organization "to"',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        link: {
            schemaDoc: 'Relationship between organizations',
            type: Relationship,
            ref: 'OrganizationLink',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        employee: {
            schemaDoc: 'Employee from "from" relationship organization',
            type: Relationship,
            ref: 'OrganizationEmployee',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        canManageEmployees: { type: Checkbox, defaultValue: false },
        canManageRoles: { type: Checkbox, defaultValue: false },
        canManageIntegrations: { type: Checkbox, defaultValue: false },
        canManageProperties: { type: Checkbox, defaultValue: false },
        canManageTickets: { type: Checkbox, defaultValue: false },
        canManageContacts: { type: Checkbox, defaultValue: false },
        canManageTicketComments: { type: Checkbox, defaultValue: true },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadOrganizationLinkEmployeeAccesses,
        create: access.canManageOrganizationLinkEmployeeAccesses,
        update: access.canManageOrganizationLinkEmployeeAccesses,
        delete: false,
        auth: true,
    },
})

module.exports = {
    OrganizationLinkEmployeeAccess,
}
