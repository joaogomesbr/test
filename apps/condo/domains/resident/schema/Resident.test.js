/**
 * Generated by `createschema resident.Resident 'user:Relationship:User:CASCADE; organization:Relationship:Organization:PROTECT; property:Relationship:Property:PROTECT; billingAccount?:Relationship:BillingAccount:SET_NULL; unitName:Text;'`
 */

const faker = require('faker')
const dayjs = require('dayjs')
const { cloneDeep } = require('lodash')

const { createTestBillingIntegrationOrganizationContext, createTestBillingIntegration, createTestBillingAccount, createTestBillingProperty, makeContextWithOrganizationAndIntegrationAsAdmin } = require('@condo/domains/billing/utils/testSchema')
const { addResidentAccess } = require('@condo/domains/user/utils/testSchema')
const { createTestProperty, makeClientWithResidentUserAndProperty, makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { buildingMapJson } = require('@condo/domains/property/constants/property')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')

const { createTestAcquiringIntegrationContext } = require('@condo/domains/acquiring/utils/testSchema')
const { createTestAcquiringIntegration } = require('@condo/domains/acquiring/utils/testSchema')
const { DEFAULT_ACQUIRING_INTEGRATION_NAME } = require('@condo/domains/acquiring/constants')
const { DEFAULT_BILLING_INTEGRATION_NAME } = require('@condo/domains/billing/constants')

const { Resident, createTestResident, updateTestResident } = require('@condo/domains/resident/utils/testSchema')
const { catchErrorFrom, expectToThrowAccessDeniedErrorToObj, expectToThrowAccessDeniedErrorToObjects } = require('../../common/utils/testSchema')
const { buildFakeAddressMeta } = require('@condo/domains/property/utils/testSchema/factories')
const { createTestTicketFile, updateTestTicketFile, createTestTicket, updateTestTicket } = require('@condo/domains/ticket/utils/testSchema')

const { makeClientWithResidentUser } = require('@condo/domains/user/utils/testSchema')

describe('Resident', () => {

    describe('resolveInput', () => {
        it('resolves address to address up to building, if flat is presented in address string', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()

            const addressMetaWithFlat = cloneDeep(userClient.property.addressMeta)
            addressMetaWithFlat.data.flat = '123'
            addressMetaWithFlat.data.flat_type = 'кв.'
            addressMetaWithFlat.value = addressMetaWithFlat.value + ', кв. 123'

            const attrs = {
                address: addressMetaWithFlat.value,
                unitName: faker.random.alphaNumeric(3),
                addressMeta: addressMetaWithFlat,
            }

            const [objCreated] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, attrs)
            expect(objCreated.address).toEqual(userClient.property.addressMeta.value)
        })
    })

    describe('validations', () => {
        it('throws error on create record with same set of fields: "address", "unitName" for current user', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const duplicatedFields = {
                address: userClient.property.address,
                unitName: faker.random.alphaNumeric(3),
            }
            await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, duplicatedFields)

            await catchErrorFrom(async () => {
                await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, duplicatedFields)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                expect(errors[0].data.messages[0]).toMatch('Cannot create resident, because another resident with the same provided "address" and "unitName" already exists for current user')
                expect(data).toEqual({ 'obj': null })
            })
        })

        it('throws error on create record with same set of fields: "address", "unitName" (in different case) for current user', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const fields = {
                address: userClient.property.address,
                unitName: '123a',
            }
            await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, fields)

            const duplicatedFields = {
                address: fields.address.toUpperCase(),
                unitName: fields.unitName.toUpperCase(),
            }

            await catchErrorFrom(async () => {
                await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, duplicatedFields)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                expect(errors[0].data.messages[0]).toMatch('Cannot create resident, because another resident with the same provided "address" and "unitName" already exists for current user')
                expect(data).toEqual({ 'obj': null })
            })
        })

        it('throws error on create record with same set of fields: "address", "unitName" for current user, ignoring flat part in "address"', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const duplicatedFields = {
                address: userClient.property.address,
                unitName: faker.random.alphaNumeric(3),
            }
            await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, duplicatedFields)

            const addressMetaWithFlat = cloneDeep(userClient.property.addressMeta)
            addressMetaWithFlat.data.flat = '123'
            addressMetaWithFlat.data.flat_type = 'кв.'
            addressMetaWithFlat.value = addressMetaWithFlat.value + ', кв. 123'

            const duplicatedFieldsWithFlatInAddress = {
                address: addressMetaWithFlat.value,
                unitName: duplicatedFields.unitName,
                addressMeta: addressMetaWithFlat,
            }

            await catchErrorFrom(async () => {
                await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, duplicatedFieldsWithFlatInAddress)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                expect(errors[0].data.messages[0]).toMatch('Cannot create resident, because another resident with the same provided "address" and "unitName" already exists for current user')
                expect(data).toEqual({ 'obj': null })
            })
        })

        it('allows to create record with same set of fields: "property", "unitName" for different user', async () => {
            const userClient = await makeClientWithProperty()
            const userClient2 = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const duplicatedFields = {
                property: { connect: { id: userClient.property.id } },
                unitName: faker.random.alphaNumeric(3),
            }
            await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, duplicatedFields)
            const [obj] = await createTestResident(adminClient, userClient2.user, userClient.organization, userClient.property, duplicatedFields)
            expect(obj.id).toMatch(UUID_RE)
        })

        it('throws error, when trying to connect new resident to property with another address', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()

            const [propertyWithAnotherAddress] = await createTestProperty(userClient, userClient.organization, { map: buildingMapJson })

            const attrs = {
                address: userClient.property.address,
                addressMeta: userClient.property.addressMeta,
            }

            await catchErrorFrom(async () => {
                await createTestResident(adminClient, userClient.user, userClient.organization, propertyWithAnotherAddress, attrs)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                expect(errors[0].data.messages[0]).toMatch('Cannot connect property, because its address differs from address of resident')
                expect(data).toEqual({ 'obj': null })
            })
        })
    })

    describe('Working with Tickets', () => {
        it('can create temporary TicketFile', async () => {
            // TODO(zuch): check id makeClientWithProperty is good for tests with resident
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const residentClient = await makeClientWithResidentUser()
            await createTestResident(adminClient, residentClient.user, userClient.organization, userClient.property)
            const [ticketFile] = await createTestTicketFile(residentClient, userClient.organization)
            expect(ticketFile.createdBy.id).toEqual(residentClient.user.id)
            expect(ticketFile.organization.id).toEqual(userClient.organization.id)
        })

        it('can create Ticket', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const residentClient = await makeClientWithResidentUser()
            await createTestResident(adminClient, residentClient.user, userClient.organization, userClient.property)
            const [ticket] = await createTestTicket(residentClient, userClient.organization, userClient.property)
            expect(ticket.createdBy.id).toEqual(residentClient.user.id)
        })

        it('can update Ticket', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const residentClient = await makeClientWithResidentUser()
            await createTestResident(adminClient, residentClient.user, userClient.organization, userClient.property)
            const [ticket] = await createTestTicket(residentClient, userClient.organization, userClient.property)
            const details = faker.lorem.sentence()
            const [updatedTicket] = await updateTestTicket(residentClient, ticket.id, { details })
            expect(updatedTicket.details).toBe(details)
            expect(updatedTicket.updatedBy.id).toBe(residentClient.user.id)
        })

        it('can connect temporary TicketFile to Ticket', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const residentClient = await makeClientWithResidentUser()
            await createTestResident(adminClient, residentClient.user, userClient.organization, userClient.property)
            const [ticketFile] = await createTestTicketFile(residentClient, userClient.organization)
            const [ticket] = await createTestTicket(residentClient, userClient.organization, userClient.property)
            const [updatedTicketFile] = await updateTestTicketFile(residentClient, ticketFile.id, { ticket: { connect: { id: ticket.id } } })
            expect(updatedTicketFile.ticket.id).toEqual(ticket.id)
        })
    })

    describe('Virtual fields', () => {
        describe('residentOrganization', () => {
            it('returns id and name of related organization', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()

                const [{ id }] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
                await addResidentAccess(userClient.user)
                const [obj] = await Resident.getAll(userClient, { id })
                expect(obj.residentOrganization).toBeDefined()
                expect(obj.residentOrganization.id).toEqual(userClient.organization.id)
                expect(obj.residentOrganization.name).toEqual(userClient.organization.name)
                expect(Object.keys(obj.residentOrganization)).toHaveLength(2)
            })

            it('returns null if no related organization', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()

                const [{ id }] = await createTestResident(adminClient, userClient.user, null, userClient.property)
                await addResidentAccess(userClient.user)
                const [obj] = await Resident.getAll(userClient, { id })
                expect(obj.residentOrganization).toBeNull()
            })
        })

        describe('residentProperty', () => {
            it('returns id, name and address of related property', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()

                const [{ id }] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
                await addResidentAccess(userClient.user)
                const [obj] = await Resident.getAll(userClient, { id })
                expect(obj.residentProperty).toBeDefined()
                expect(obj.residentProperty.id).toEqual(userClient.property.id)
                expect(obj.residentProperty.name).toEqual(userClient.property.name)
                expect(obj.residentProperty.address).toEqual(userClient.property.address)
                expect(Object.keys(obj.residentProperty)).toHaveLength(3)
            })

            it('returns null if no related property', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()

                const address = faker.lorem.words()
                const attrs = {
                    address,
                    addressMeta: buildFakeAddressMeta(address),
                }
                console.log('user and admin clients created')

                const [{ id }] = await createTestResident(adminClient, userClient.user, userClient.organization, null, attrs)
                await addResidentAccess(userClient.user)
                const [obj] = await Resident.getAll(userClient, { id })
                expect(obj.residentProperty).toBeNull()
            })
        })

        describe('organizationFeatures', () => {
            it('correctly sets the hasBillingData if billing data is available', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()

                const [integration] = await createTestBillingIntegration(adminClient)
                const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration, {
                    lastReport: {
                        period: '2021-09-01',
                        finishTime: dayjs().toISOString(),
                        totalReceipts: 3141592,
                    },
                })

                const [{ id }] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
                await addResidentAccess(userClient.user)
                const [obj] = await Resident.getAll(userClient, { id })

                expect(obj.organizationFeatures.hasBillingData).toBe(true)
            })

            it('correctly sets the hasBillingData if no context available', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()

                const [{ id }] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
                await addResidentAccess(userClient.user)
                const [obj] = await Resident.getAll(userClient, { id })

                expect(obj.organizationFeatures.hasBillingData).toBe(false)
            })

            it('correctly sets the hasBillingData if no billing data available', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()

                const [integration] = await createTestBillingIntegration(adminClient)
                const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)

                const [{ id }] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
                await addResidentAccess(userClient.user)
                const [obj] = await Resident.getAll(userClient, { id })

                expect(obj.organizationFeatures.hasBillingData).toBe(false)
            })

            it('returns null if no organization', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()

                const address = faker.lorem.words()
                const attrs = {
                    address,
                    addressMeta: buildFakeAddressMeta(address),
                }

                const [{ id }] = await createTestResident(adminClient, userClient.user, null, null, attrs)
                await addResidentAccess(userClient.user)
                const [obj] = await Resident.getAll(userClient, { id })
                expect(obj.organizationFeatures).toBeNull()
            })
        })

        describe('paymentCategories', () => {
            it('correctly sets the paymentCategories if resident.org has everything', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()

                const [billingIntegration] = await createTestBillingIntegration(adminClient)
                await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, billingIntegration)

                const [acquiringIntegration] = await createTestAcquiringIntegration(adminClient, [billingIntegration])
                await createTestAcquiringIntegrationContext(adminClient, userClient.organization, acquiringIntegration)

                const [{ id }] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
                await addResidentAccess(userClient.user)
                const [obj] = await Resident.getAll(userClient, { id })

                expect(obj.paymentCategories).toBeDefined()
                expect(obj.paymentCategories[0].billingName).toEqual(billingIntegration.name)
                expect(obj.paymentCategories[0].acquiringName).toEqual(acquiringIntegration.name)
                expect(obj.paymentCategories[1].billingName).toEqual(DEFAULT_BILLING_INTEGRATION_NAME)
                expect(obj.paymentCategories[1].acquiringName).toEqual(DEFAULT_ACQUIRING_INTEGRATION_NAME)
            })

            it('correctly sets the paymentCategories if resident.org has no acquiring', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()

                const [billingIntegration] = await createTestBillingIntegration(adminClient)
                await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, billingIntegration)

                const [{ id }] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
                await addResidentAccess(userClient.user)
                const [obj] = await Resident.getAll(userClient, { id })

                expect(obj.paymentCategories).toBeDefined()
                expect(obj.paymentCategories[0].billingName).toEqual(billingIntegration.name)
                expect(obj.paymentCategories[0].acquiringName).toEqual(DEFAULT_ACQUIRING_INTEGRATION_NAME)
                expect(obj.paymentCategories[1].billingName).toEqual(DEFAULT_BILLING_INTEGRATION_NAME)
                expect(obj.paymentCategories[1].acquiringName).toEqual(DEFAULT_ACQUIRING_INTEGRATION_NAME)
            })

            it('correctly sets the paymentCategories if resident.org has no billing', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()

                const [billingIntegration] = await createTestBillingIntegration(adminClient)
                const [acquiringIntegration] = await createTestAcquiringIntegration(adminClient, [billingIntegration])
                await createTestAcquiringIntegrationContext(adminClient, userClient.organization, acquiringIntegration)

                const [{ id }] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
                await addResidentAccess(userClient.user)
                const [obj] = await Resident.getAll(userClient, { id })

                expect(obj.paymentCategories).toBeDefined()
                expect(obj.paymentCategories[0].billingName).toEqual(DEFAULT_BILLING_INTEGRATION_NAME)
                expect(obj.paymentCategories[0].acquiringName).toEqual(acquiringIntegration.name)
                expect(obj.paymentCategories[1].billingName).toEqual(DEFAULT_BILLING_INTEGRATION_NAME)
                expect(obj.paymentCategories[1].acquiringName).toEqual(DEFAULT_ACQUIRING_INTEGRATION_NAME)
            })

            it('correctly sets the paymentCategories if resident has no org', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()

                const [{ id }] = await createTestResident(adminClient, userClient.user, null, userClient.property)
                await addResidentAccess(userClient.user)
                const [obj] = await Resident.getAll(userClient, { id })

                expect(obj.paymentCategories).toBeDefined()
                expect(obj.paymentCategories[0].billingName).toEqual(DEFAULT_BILLING_INTEGRATION_NAME)
                expect(obj.paymentCategories[0].acquiringName).toEqual(DEFAULT_ACQUIRING_INTEGRATION_NAME)
                expect(obj.paymentCategories[1].billingName).toEqual(DEFAULT_BILLING_INTEGRATION_NAME)
                expect(obj.paymentCategories[1].acquiringName).toEqual(DEFAULT_ACQUIRING_INTEGRATION_NAME)
            })
        })
    })

    describe('Create', () => {
        it('can be created by admin', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()

            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [billingProperty] = await createTestBillingProperty(adminClient, context)
            const [billingAccount] = await createTestBillingAccount(adminClient, context, billingProperty)

            const [obj, attrs] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
            expect(obj.user.id).toEqual(userClient.user.id)
            expect(obj.organization.id).toEqual(userClient.organization.id)
            expect(obj.property.id).toEqual(userClient.property.id)
        })

        it('cannot be created by user', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const [organization] = await createTestOrganization(adminClient)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestResident(userClient, userClient.user, organization, userClient.property)
            })
        })

        it('cannot be created by anonymous', async () => {
            const userClient = await makeClientWithProperty()
            const anonymous = await makeClient()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestResident(anonymous, userClient.user, userClient.organization, userClient.property)
            })
        })
    })

    describe('Read', () => {
        it('can be read by admin', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
            const objs = await Resident.getAll(adminClient, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs.length >= 1).toBeTruthy()
            expect(objs[0].id).toMatch(obj.id)
        })

        it('cannot be read by user, who is employed in organization, which manages associated property', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
            await expectToThrowAccessDeniedErrorToObjects(async () => {
                await Resident.getAll(userClient, {}, { sortBy: ['updatedAt_DESC'] })
            })
        })

        it('user with type "resident" can read only own residents', async () => {
            const userClient = await makeClientWithProperty()
            await addResidentAccess(userClient.user)
            const anotherUserClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
            await createTestResident(adminClient, anotherUserClient.user, anotherUserClient.organization, userClient.property)
            const objs = await Resident.getAll(userClient, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs).toHaveLength(1)
            expect(objs[0].id).toMatch(obj.id)
        })

        it('cannot be read by anonymous', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const anonymousClient = await makeClient()
            await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
            await expectToThrowAccessDeniedErrorToObjects(async () => {
                await Resident.getAll(anonymousClient)
            })
        })
    })

    describe('Update', () => {
        it('cannot be updated by changing address, addressMeta, property or unitName', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

            await catchErrorFrom(async () => {
                const payload = {
                    unitName: faker.random.alphaNumeric(3),
                }
                await updateTestResident(adminClient, obj.id, payload)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                expect(errors[0].data.messages[0]).toMatch('Changing of address, addressMeta, unitName or property is not allowed for already existing Resident')
                expect(data).toEqual({ 'obj': null })
            })

            await catchErrorFrom(async () => {
                const payload = {
                    address: faker.lorem.words(),
                }
                await updateTestResident(adminClient, obj.id, payload)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                expect(errors[0].data.messages[0]).toMatch('Changing of address, addressMeta, unitName or property is not allowed for already existing Resident')
                expect(data).toEqual({ 'obj': null })
            })

            await catchErrorFrom(async () => {
                const [property] = await createTestProperty(userClient, userClient.organization, { map: buildingMapJson })
                // `property` should correspond to `address` to not overlap with another test case of `property` validation with will cause error "Cannot connect property, because its address differs from address of resident"
                const payload = {
                    address: property.address,
                    property: { connect: { id: property.id } },
                }
                await updateTestResident(adminClient, obj.id, payload)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                expect(errors[0].data.messages[0]).toMatch('Changing of address, addressMeta, unitName or property is not allowed for already existing Resident')
                expect(data).toEqual({ 'obj': null })
            })
        })

        it('cannot be updated by other user with type resident', async () => {
            const userClient = await makeClientWithResidentUserAndProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

            const otherUserClient = await makeClientWithResidentUserAndProperty()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestResident(otherUserClient, obj.id, {})
            })
        })

        it('can be updated by admin', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

            const [objUpdated, attrs] = await updateTestResident(adminClient, obj.id)

            expect(objUpdated.id).toEqual(obj.id)
            expect(objUpdated.dv).toEqual(1)
            expect(objUpdated.sender).toEqual(attrs.sender)
            expect(objUpdated.v).toEqual(2)
            expect(objUpdated.newId).toEqual(null)
            expect(objUpdated.deletedAt).toEqual(null)
            expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(objUpdated.createdAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
        })

        it('cannot be updated by anonymous', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const anonymousClient = await makeClient()

            const [obj] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestResident(anonymousClient, obj.id)
            })
        })
    })

    describe('Delete', () => {
        it('cannot be deleted by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()

            const [obj] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await Resident.delete(adminClient, obj.id)
            })
        })

        it('cannot be deleted by user', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()

            const [obj] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await Resident.delete(userClient, obj.id)
            })
        })

        it('cannot be deleted by anonymous', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const anonymousClient = await makeClient()

            const [obj] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await Resident.delete(anonymousClient, obj.id)
            })
        })

        it('can be soft-deleted using update operation by admin', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

            const [objUpdated, attrs] = await Resident.softDelete(adminClient, obj.id)

            expect(objUpdated.id).toEqual(obj.id)
            expect(objUpdated.dv).toEqual(1)
            expect(objUpdated.sender).toEqual(attrs.sender)
            expect(objUpdated.deletedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
        })

        it('can be soft-deleted using update operation by current user with type resident', async () => {
            const userClient = await makeClientWithResidentUserAndProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

            const [objUpdated, attrs] = await Resident.softDelete(userClient, obj.id)

            expect(objUpdated.id).toEqual(obj.id)
            expect(objUpdated.dv).toEqual(1)
            expect(objUpdated.sender).toEqual(attrs.sender)
            expect(objUpdated.deletedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
        })

        it('cannot be soft-deleted using update operation by current user with type resident when other fields gets passed as variables', async () => {
            const userClient = await makeClientWithResidentUserAndProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

            const notAllowedPayload = {
                address: faker.lorem.words(),
            }

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await Resident.softDelete(userClient, obj.id, notAllowedPayload)
            })
        })

        it('cannot be soft-deleted using update operation by other user with type resident', async () => {
            const userClient = await makeClientWithResidentUserAndProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

            const otherUserClient = await makeClientWithResidentUserAndProperty()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await Resident.softDelete(otherUserClient, obj.id)
            })
        })
    })
})
