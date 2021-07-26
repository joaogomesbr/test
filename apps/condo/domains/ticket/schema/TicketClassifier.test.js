/**
 * Generated by `createschema ticket.TicketClassifier 'organization?:Relationship:Organization:CASCADE;name:Text;parent?:Relationship:TicketClassifier:PROTECT;'`
 */
const { makeLoggedInAdminClient, makeClient, makeLoggedInClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')
const { makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { createTestUser } = require('@condo/domains/user/utils/testSchema')
const { TicketClassifier, createTestTicketClassifier, updateTestTicketClassifier } = require('@condo/domains/ticket/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObjects, expectToThrowAuthenticationErrorToObjects, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')
const faker = require('faker')

describe('TicketClassifier CRUD', () => {
    describe('User', () => {
        it('can not create', async () => {
            const admin = await makeLoggedInAdminClient()
            const [_, userAttrs] = await createTestUser(admin)
            const client = await makeLoggedInClient(userAttrs)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicketClassifier(client)
            })
        })
        it('can read', async () => {
            const admin = await makeLoggedInAdminClient()
            const [_, userAttrs] = await createTestUser(admin)
            const client = await makeLoggedInClient(userAttrs)
            const [objCreated, attrs] = await createTestTicketClassifier(admin)
            const objs = await TicketClassifier.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs[0].id).toMatch(objCreated.id)
            expect(objs[0].dv).toEqual(1)
            expect(objs[0].sender).toEqual(attrs.sender)
            expect(objs[0].v).toEqual(1)
            expect(objs[0].newId).toEqual(null)
            expect(objs[0].parent).toEqual(null)
            expect(objs[0].deletedAt).toEqual(null)
            expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].createdAt).toMatch(objCreated.createdAt)
            expect(objs[0].updatedAt).toMatch(objCreated.updatedAt)
        })
        it('can not update', async () => {
            const admin = await makeLoggedInAdminClient()
            const [_, userAttrs] = await createTestUser(admin)
            const client = await makeLoggedInClient(userAttrs)
            const [objCreated] = await createTestTicketClassifier(admin)
            const payload = { name: faker.lorem.word() }
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestTicketClassifier(client, objCreated.id, payload)
            })
        })
        it('can not delete', async () => {
            const admin = await makeLoggedInAdminClient()
            const [_, userAttrs] = await createTestUser(admin)
            const [objCreated] = await createTestTicketClassifier(admin)
            const client = await makeLoggedInClient(userAttrs)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await TicketClassifier.delete(client, objCreated.id)
            })
        })
    })
    describe('Support', () => {
        it('can create', async () => {
            const support = await makeClientWithSupportUser()
            const [obj, attrs] = await createTestTicketClassifier(support)
            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.parent).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: support.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: support.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
        })
        it('can read', async () => {
            const admin = await makeLoggedInAdminClient()
            const support = await makeClientWithSupportUser()
            const [objCreated, attrs] = await createTestTicketClassifier(admin)
            const objs = await TicketClassifier.getAll(support, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs[0].id).toMatch(objCreated.id)
            expect(objs[0].dv).toEqual(1)
            expect(objs[0].sender).toEqual(attrs.sender)
            expect(objs[0].v).toEqual(1)
            expect(objs[0].newId).toEqual(null)
            expect(objs[0].parent).toEqual(null)
            expect(objs[0].deletedAt).toEqual(null)
            expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].createdAt).toMatch(objCreated.createdAt)
            expect(objs[0].updatedAt).toMatch(objCreated.updatedAt)
        })
        it('can update', async () => {
            const admin = await makeLoggedInAdminClient()
            const support = await makeClientWithSupportUser()
            const [objCreated] = await createTestTicketClassifier(admin)
            const payload = { name: faker.lorem.word() }
            const [obj] = await updateTestTicketClassifier(support, objCreated.id, payload)
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: support.user.id }))
            expect(obj.name).toEqual(payload.name)
        })
        it('can not delete', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestTicketClassifier(admin)
            const support = await makeClientWithSupportUser()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await TicketClassifier.delete(support, objCreated.id)
            })
        })
    })
    describe('Anonymous', () => {
        it('can not create', async () => {
            const client = await makeClient()
            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestTicketClassifier(client)
            })
        })
        // TODO(zuch): if we have access to model for anonymous to read - it will still fail as anonymous do not have access to allUsers - and createBy field will fail
        it('can read', async () => {
            const client = await makeClient()
            await expectToThrowAuthenticationErrorToObjects(async () => {
                await TicketClassifier.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
            })
        })
        it('can not update', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestTicketClassifier(admin)
            const client = await makeClient()
            const payload = { name: faker.lorem.word() }
            await expectToThrowAuthenticationErrorToObj(async () => {
                await updateTestTicketClassifier(client, objCreated.id, payload)
            })
        })
        it('can not delete', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestTicketClassifier(admin)
            const client = await makeClient()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await TicketClassifier.delete(client, objCreated.id)
            })
        })
    })
})
