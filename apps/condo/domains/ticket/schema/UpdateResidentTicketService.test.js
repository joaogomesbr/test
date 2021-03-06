/**
 * Generated by `createservice ticket.UpdateResidentTicketService --type mutations`
 */
const { createResidentTicketByTestClient } = require('@condo/domains/ticket/utils/testSchema')
const { makeClientWithResidentAccessAndProperty } = require('@condo/domains/property/utils/testSchema')
const { updateResidentTicketByTestClient } = require('@condo/domains/ticket/utils/testSchema')
const faker = require('faker')
const { catchErrorFrom } = require('@condo/domains/common/utils/testSchema')
const { expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')
const { makeClient } = require('@core/keystone/test.utils')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { makeLoggedInAdminClient } = require('@core/keystone/test.utils')
const { NOT_FOUND_ERROR } = require('@condo/domains/common/constants/errors')
 
describe('UpdateResidentTicketService', () => {
    test('resident: can update ticket', async () => {
        const userClient = await makeClientWithResidentAccessAndProperty()
        const [ticket] = await createResidentTicketByTestClient(userClient, userClient.property)
        const newDetails = faker.random.alphaNumeric(21)
        const payload = {
            details: newDetails,
        }
        const [updatedTicket] = await updateResidentTicketByTestClient(userClient, ticket.id, payload)

        expect(updatedTicket.id).toEqual(ticket.id)
        expect(updatedTicket.details).toEqual(newDetails)
    })

    test('resident: cannot update not own ticket', async () => {
        const userClient = await makeClientWithResidentAccessAndProperty()
        const userClient1 = await makeClientWithResidentAccessAndProperty()

        const [ticket] = await createResidentTicketByTestClient(userClient1, userClient.property)
        const newDetails = faker.random.alphaNumeric(21)
        const payload = {
            details: newDetails,
        }

        await catchErrorFrom(async () => {
            await updateResidentTicketByTestClient(userClient, ticket.id, payload)
        }, ({ errors, data }) => {
            expect(errors).toHaveLength(1)
            expect(errors[0].message).toEqual(`${NOT_FOUND_ERROR}ticket] no ticket was found with this id for this user`)
            expect(data).toEqual({ 'obj': null })
        })
    })

    test('resident: cannot update ticket fields which not in ResidentTicketUpdateInput', async () => {
        const userClient = await makeClientWithResidentAccessAndProperty()
        const [ticket] = await createResidentTicketByTestClient(userClient, userClient.property)
        const payload = {
            unitName:  faker.random.alphaNumeric(5),
        }

        await catchErrorFrom(async () => {
            await updateResidentTicketByTestClient(userClient, ticket.id, payload)
        }, ({ errors, data }) => {
            expect(errors).toHaveLength(1)
            expect(errors[0].message).toContain('Field "unitName" is not defined by type "ResidentTicketUpdateInput"')
        })
    })

    test('admin: can update resident ticket', async () => {
        const admin = await makeLoggedInAdminClient()
        const userClient = await makeClientWithResidentAccessAndProperty()
        const [ticket] = await createResidentTicketByTestClient(userClient, userClient.property)
        const newDetails = faker.random.alphaNumeric(21)
        const payload = {
            details: newDetails,
        }
        const [updatedTicket] = await updateResidentTicketByTestClient(admin, ticket.id, payload)

        expect(updatedTicket.id).toEqual(ticket.id)
        expect(updatedTicket.details).toEqual(newDetails)
    })

    test('user: cannot update resident ticket', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const residentClient = await makeClientWithResidentAccessAndProperty()
        const [ticket] = await createResidentTicketByTestClient(residentClient, residentClient.property)
        const newDetails = faker.random.alphaNumeric(21)
        const payload = {
            details: newDetails,
        }

        await catchErrorFrom(async () => {
            await updateResidentTicketByTestClient(client, ticket.id, payload)
        }, ({ errors, data }) => {
            expect(errors).toHaveLength(1)
            expect(errors[0].message).toEqual(`${NOT_FOUND_ERROR}ticket] no ticket was found with this id for this user`)
        })
    })

    test('anonymous: cannot update resident ticket', async () => {
        const residentClient = await makeClientWithResidentAccessAndProperty()
        const [ticket] = await createResidentTicketByTestClient(residentClient, residentClient.property)

        const client = await makeClient()
        await expectToThrowAuthenticationErrorToObj(async () => {
            await updateResidentTicketByTestClient(client, ticket.id, {})
        })
    })
})