/**
 * Generated by `createschema billing.BillingReceipt 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; account:Relationship:BillingAccount:CASCADE; period:CalendarDay; raw:Json; toPay:Text; services:Json; meta:Json'`
 */

const faker = require('faker')
const { createTestBillingIntegrationOrganizationContext } = require('../utils/testSchema')
const { makeOrganizationIntegrationManager } = require('../utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestBillingAccount } = require('../utils/testSchema')
const { createTestBillingProperty } = require('../utils/testSchema')
const { makeContextWithOrganizationAndIntegrationAsAdmin } = require('../utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { BillingReceipt, createTestBillingReceipt, updateTestBillingReceipt } = require('@condo/domains/billing/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObjects, expectToThrowAuthenticationErrorToObjects, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')

describe('BillingReceipt', () => {
    test('admin: create BillingReceipt', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)

        expect(obj.account.id).toEqual(billingAccount.id)
        expect(obj.context.id).toEqual(context.id)
        expect(obj.property.id).toEqual(property.id)
    })

    test('user: create BillingReceipt', async () => {
        const user = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestBillingReceipt(user, context, property, billingAccount)
        })
    })

    test('organization integration manager: create BillingReceipt', async () => {
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [obj] = await createTestBillingReceipt(managerUserClient, context, property, billingAccount)

        expect(obj.account.id).toEqual(billingAccount.id)
        expect(obj.context.id).toEqual(context.id)
        expect(obj.property.id).toEqual(property.id)
    })

    test('anonymous: create BillingReceipt', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)

        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestBillingReceipt(client, context, property, billingAccount)
        })
    })

    test('admin: read BillingReceipt', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)
        const objs = await BillingReceipt.getAll(admin, { id: obj.id })

        expect(objs).toHaveLength(1)
    })

    test('organization integration manager: read BillingReceipt', async () => {
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [obj] = await createTestBillingReceipt(managerUserClient, context, property, billingAccount)
        const objs = await BillingReceipt.getAll(managerUserClient, { id: obj.id })

        expect(objs).toHaveLength(1)
    })

    test('user: read BillingReceipt', async () => {
        const user = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const objs = await BillingReceipt.getAll(user, { id: billingAccount.id })

        expect(objs).toHaveLength(0)
    })

    test('anonymous: read BillingReceipt', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)

        await expectToThrowAuthenticationErrorToObjects(async () => {
            await BillingReceipt.getAll(client, { id: billingAccount.id })
        })
    })

    test('admin: update BillingReceipt', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)
        const text = faker.lorem.words()
        const payload = {
            meta: {
                dv: 1,
                text,
            },
        }
        const [objUpdated] = await updateTestBillingReceipt(admin, obj.id, payload)

        expect(obj.id).toEqual(objUpdated.id)
        expect(objUpdated.meta.text).toEqual(text)
    })

    test('organization integration manager: update BillingReceipt', async () => {
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [obj] = await createTestBillingReceipt(managerUserClient, context, property, billingAccount)
        const text = faker.lorem.words()
        const payload = {
            meta: {
                dv: 1,
                text,
            },
        }
        const [objUpdated] = await updateTestBillingReceipt(managerUserClient, obj.id, payload)

        expect(obj.id).toEqual(objUpdated.id)
        expect(objUpdated.meta.text).toEqual(text)
    })

    test('user: update BillingReceipt', async () => {
        const user = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)
        const payload = {}
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestBillingReceipt(user, obj.id, payload)
        })
    })

    test('anonymous: update BillingReceipt', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)
        const payload = {}
        await expectToThrowAuthenticationErrorToObj(async () => {
            await updateTestBillingReceipt(client, obj.id, payload)
        })
    })

    test('user: delete BillingReceipt', async () => {
        const user = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingReceipt.delete(user, obj.id)
        })
    })

    test('anonymous: delete BillingReceipt', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingReceipt.delete(client, obj.id)
        })
    })
})

