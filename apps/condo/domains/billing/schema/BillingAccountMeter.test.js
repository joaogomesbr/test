/**
 * Generated by `createschema billing.BillingAccountMeter 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; account:Relationship:BillingAccount:CASCADE; resource:Relationship:BillingMeterResource:PROTECT; raw:Json; meta:Json'`
 */

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')

const { BillingAccountMeter, createTestBillingAccountMeter, updateTestBillingAccountMeter } = require('@condo/domains/billing/utils/testSchema')

describe('BillingAccountMeter', () => {
    test.skip('user: create BillingAccountMeter', async () => {
        const client = await makeClient()  // TODO(codegen): use truly useful client!

        const [obj, attrs] = await createTestBillingAccountMeter(client)  // TODO(codegen): write 'user: create BillingAccountMeter' test
        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.newId).toEqual(null)
        expect(obj.deletedAt).toEqual(null)
        expect(obj.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(obj.createdAt).toMatch(DATETIME_RE)
        expect(obj.updatedAt).toMatch(DATETIME_RE)
    })

    test.skip('anonymous: create BillingAccountMeter', async () => {
        const client = await makeClient()
        try {
            await createTestBillingAccountMeter(client)  // TODO(codegen): check the 'anonymous: create BillingAccountMeter' test!
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(e.data).toEqual({ 'obj': null })
        }
    })

    test.skip('user: read BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const [obj, attrs] = await createTestBillingAccountMeter(admin)  // TODO(codegen): check create function!

        const client = await makeClient()  // TODO(codegen): use truly useful client!
        const objs = await BillingAccountMeter.getAll(client)

        // TODO(codegen): check 'user: read BillingAccountMeter' test!
        expect(objs).toHaveLength(1)
        expect(objs[0].id).toMatch(obj.id)
        expect(objs[0].dv).toEqual(1)
        expect(objs[0].sender).toEqual(attrs.sender)
        expect(objs[0].v).toEqual(1)
        expect(objs[0].newId).toEqual(null)
        expect(objs[0].deletedAt).toEqual(null)
        expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(objs[0].createdAt).toMatch(obj.createdAt)
        expect(objs[0].updatedAt).toMatch(obj.updatedAt)
    })

    test.skip('anonymous: read BillingAccountMeter', async () => {
        const client = await makeClient()

        try {
            await BillingAccountMeter.getAll(client)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['objs'],
            })
            expect(e.data).toEqual({ 'objs': null })
        }
    })

    test.skip('user: update BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestBillingAccountMeter(admin)  // TODO(codegen): check create function!

        const client = await makeClient()  // TODO(codegen): use truly useful client!
        const payload = {}  // TODO(codegen): change the 'user: update BillingAccountMeter' payload
        const [objUpdated, attrs] = await updateTestBillingAccountMeter(client, objCreated.id, payload)

        // TODO(codegen): white checks for 'user: update BillingAccountMeter' test
        expect(objUpdated.id).toEqual(objCreated.id)
        expect(objUpdated.dv).toEqual(1)
        expect(objUpdated.sender).toEqual(attrs.sender)
        expect(objUpdated.v).toEqual(2)
        expect(objUpdated.newId).toEqual(null)
        expect(objUpdated.deletedAt).toEqual(null)
        expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(objUpdated.createdAt).toMatch(DATETIME_RE)
        expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
        expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
    })

    test.skip('anonymous: update BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestBillingAccountMeter(admin)  // TODO(codegen): check create function!

        const client = await makeClient()
        const payload = {}  // TODO(codegen): change the 'anonymous: update BillingAccountMeter' payload
        try {
            await updateTestBillingAccountMeter(client, objCreated.id, payload)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(e.data).toEqual({ 'obj': null })
        }
    })

    test.skip('user: delete BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestBillingAccountMeter(admin)  // TODO(codegen): check create function!

        const client = await makeClient()  // TODO(codegen): use truly useful client!
        try {
            // TODO(codegen): check 'user: delete BillingAccountMeter' test!
            await BillingAccountMeter.delete(client, objCreated.id)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(e.data).toEqual({ 'obj': null })
        }
    })

    test.skip('anonymous: delete BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestBillingAccountMeter(admin)  // TODO(codegen): check create function!

        const client = await makeClient()
        try {
            // TODO(codegen): check 'anonymous: delete BillingAccountMeter' test!
            await BillingAccountMeter.delete(client, objCreated.id)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(e.data).toEqual({ 'obj': null })
        }
    })
})
