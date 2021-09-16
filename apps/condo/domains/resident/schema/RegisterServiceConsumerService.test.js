/**
 * Generated by `createservice resident.RegisterServiceConsumerService --type mutations`
 */

const { makeClient } = require('@core/keystone/test.utils')
const { catchErrorFrom, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')
const { updateTestUser } = require('@condo/domains/user/utils/testSchema')
const { RESIDENT } = require('@condo/domains/user/constants/common')
const { createTestResident } = require('@condo/domains/resident/utils/testSchema')
const { createTestBillingProperty, createTestBillingAccount, createTestBillingIntegration, createTestBillingIntegrationOrganizationContext } = require('@condo/domains/billing/utils/testSchema')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { makeLoggedInAdminClient } = require('@core/keystone/test.utils')
const { registerServiceConsumerByTestClient } = require('@condo/domains/resident/utils/testSchema')
 
describe('RegisterServiceConsumerService', () => {
    it('creates b2b-integration serviceConsumer for valid input as resident', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })

        const payload = {
            residentId: resident.id,
            unitName: billingAccountAttrs.unitName,
            accountNumber: billingAccountAttrs.number,
        }
        const out = await registerServiceConsumerByTestClient(userClient, payload)

        expect(out).not.toEqual(undefined)
    })

    // todo(toplenboren) remove this once B2C integration case is ready
    it('does not create b2b-integration serviceConsumer without organization', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, undefined, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })

        const payload = {
            residentId: resident.id,
            unitName: billingAccountAttrs.unitName,
            accountNumber: billingAccountAttrs.number,
        }

        await catchErrorFrom(async () => {
            await registerServiceConsumerByTestClient(userClient, payload)
        }, (e) => {
            expect(e.errors[0].message).toContain('BillingAccounts not found')
        })
    })

    it('does not create b2b-integration serviceConsumer for not valid unit name', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })

        const payload = {
            residentId: resident.id,
            unitName: billingAccountAttrs.unitName + 'not-valid-buddy',
            accountNumber: billingAccountAttrs.number,
        }

        await catchErrorFrom(async () => {
            await registerServiceConsumerByTestClient(userClient, payload)
        }, (e) => {
            expect(e.errors[0].message).toContain('BillingAccounts not found')
        })
    })

    it('does not create b2b-integration serviceConsumer for not valid account number', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })

        const payload = {
            residentId: resident.id,
            unitName: billingAccountAttrs.unitName,
            accountNumber: billingAccountAttrs.number + 'not-valid-buddy',
        }

        await catchErrorFrom(async () => {
            await registerServiceConsumerByTestClient(userClient, payload)
        }, (e) => {
            expect(e.errors[0].message).toContain('BillingAccounts not found')
        })
    })

    it('does not create b2b-integration serviceConsumer for nullish data', async () => {

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await updateTestUser(adminClient, userClient.user.id, { type: RESIDENT })
        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })

        const payloadWithNullishAccountName = {
            residentId: resident.id,
            unitName: billingAccountAttrs.unitName,
            accountNumber: '',
        }

        await catchErrorFrom(async () => {
            await registerServiceConsumerByTestClient(userClient, payloadWithNullishAccountName)
        }, (e) => {
            expect(e.errors[0].message).toContain('BillingAccounts not found')
        })

        const payloadWithNullishUnitName = {
            residentId: resident.id,
            unitName: billingAccountAttrs.unitName,
            accountNumber: '',
        }

        await catchErrorFrom(async () => {
            await registerServiceConsumerByTestClient(userClient, payloadWithNullishUnitName)
        }, (e) => {
            expect(e.message).not.toEqual(undefined)
        })

        const payloadWithNullishUnitNameAndAccountName = {
            residentId: resident.id,
            unitName: billingAccountAttrs.unitName,
            accountNumber: '',
        }

        await catchErrorFrom(async () => {
            await registerServiceConsumerByTestClient(userClient, payloadWithNullishUnitNameAndAccountName)
        }, (e) => {
            expect(e.errors[0].message).toContain('BillingAccounts not found')
        })
    })

    it('cannot be invoked by non-resident user', async () => {

        const userClient = await makeClientWithProperty()

        const payload = {
            residentId: 'test-id',
            unitName: 'test-unitname',
            accountNumber: 'test-number',
        }

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await registerServiceConsumerByTestClient(userClient, payload)
        })
    })

    it('cannot be invoked by anonymous', async () => {

        const userClient = await makeClient()

        const payload = {
            residentId: 'test-id',
            unitName: 'test-unitname',
            accountNumber: 'test-number',
        }

        await expectToThrowAuthenticationErrorToObj(async () => {
            await registerServiceConsumerByTestClient(userClient, payload)
        })
    })
})