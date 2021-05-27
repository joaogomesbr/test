/**
 * Generated by `createschema organization.OrganizationEmployee 'organization:Relationship:Organization:CASCADE; user:Relationship:User:SET_NULL; inviteCode:Text; name:Text; email:Text; phone:Text; role:Relationship:OrganizationEmployeeRole:SET_NULL; isAccepted:Checkbox; isRejected:Checkbox' --force`
 */
const faker = require('faker')
const { v4: uuid } = require('uuid')

const { Text, Relationship, Uuid, Checkbox } = require('@keystonejs/fields')

const { userIsAdmin } = require('@core/keystone/access')
const access = require('@condo/domains/organization/access/OrganizationEmployee')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, tracked, softDeleted } = require('@core/keystone/plugins')

const { ORGANIZATION_OWNED_FIELD, SENDER_FIELD, DV_FIELD } = require('../../../schema/_common')
const { DV_UNKNOWN_VERSION_ERROR } = require('@condo/domains/common/constants/errors')
const { hasRequestAndDbFields, hasOneOfFields } = require('@condo/domains/common/utils/validation.utils')
const { normalizePhone } = require('@condo/domains/common/utils/phone')

const OrganizationEmployee = new GQLListSchema('OrganizationEmployee', {
    schemaDoc: 'B2B customer employees',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,
        organization: { ...ORGANIZATION_OWNED_FIELD, ref: 'Organization.employees' },
        user: {
            schemaDoc: 'If user exists => invite is matched by email/phone (user can reject or accept it)',
            type: Relationship,
            ref: 'User',
            isRequired: false,
            knexOptions: { isNotNullable: false }, // Relationship only!
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
            access: {
                read: true,
                update: userIsAdmin,
                // Allow employee to assign user for the first time, when it creates another employee
                create: access.canManageOrganizationEmployees,
            },
        },
        inviteCode: {
            schemaDoc: 'Secret invite code (used for accept invite verification)',
            type: Uuid,
            defaultValue: () => uuid(),
            kmigratorOptions: { null: true, unique: true },
            access: {
                read: userIsAdmin,
                update: userIsAdmin,
                create: userIsAdmin,
            },
        },
        name: {
            factory: () => faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}'),
            type: Text,
        },
        email: {
            factory: () => faker.internet.exampleEmail().toLowerCase(),
            type: Text,
            isRequired: false,
            kmigratorOptions: { null: true },
            hooks: {
                resolveInput: async ({ resolvedData }) => {
                    return resolvedData['email'] && resolvedData['email'].toLowerCase()
                },
            },
        },
        phone: {
            type: Text,
            isRequired: false,
            kmigratorOptions: { null: true },
            hooks: {
                resolveInput: async ({ resolvedData }) => {
                    return normalizePhone(resolvedData['phone'])
                },
            },
        },
        role: {
            type: Relationship,
            ref: 'OrganizationEmployeeRole',
            isRequired: true,
            knexOptions: { isNotNullable: false }, // Relationship only!
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
        position: {
            type: Text,
            isRequired: false,
        },
        isAccepted: {
            type: Checkbox,
            defaultValue: false,
            knexOptions: { isNotNullable: false },
            access: {
                read: true,
                create: userIsAdmin,
                update: userIsAdmin,
            },
        },
        isRejected: {
            type: Checkbox,
            defaultValue: false,
            knexOptions: { isNotNullable: false },
            access: {
                read: true,
                create: userIsAdmin,
                update: userIsAdmin,
            },
        },
        isBlocked: {
            type: Checkbox,
            defaultValue: false,
        },
    },
    plugins: [versioned(), tracked(), historical(), softDeleted()],
    access: {
        read: access.canReadOrganizationEmployees,
        create: access.canManageOrganizationEmployees,
        update: access.canManageOrganizationEmployees,
        delete: access.canManageOrganizationEmployees,
        auth: true,
    },
    hooks: {
        validateInput: ({ resolvedData, existingItem, addValidationError }) => {
            if (!hasRequestAndDbFields(['dv', 'sender'], ['organization'], resolvedData, existingItem, addValidationError)) return
            if (!hasOneOfFields(['email', 'name', 'phone'], resolvedData, existingItem, addValidationError)) return
            const { dv } = resolvedData
            if (dv === 1) {
                // NOTE: version 1 specific translations. Don't optimize this logic
            } else {
                return addValidationError(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown \`dv\``)
            }
        },
    },
})

module.exports = {
    OrganizationEmployee,
}
