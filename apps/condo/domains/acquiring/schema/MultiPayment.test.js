/**
 * Generated by `createschema acquiring.MultiPayment 'amount:Decimal; commission?:Decimal; time:DateTimeUtc; cardNumber:Text; serviceCategory:Text;'`
 */

const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { makePayerAndPayments, makePayer } = require('@condo/domains/acquiring/utils/testSchema')

const {
    MultiPayment,
    createTestMultiPayment,
    updateTestMultiPayment,
    createTestAcquiringIntegration,
    createTestAcquiringIntegrationAccessRight,
    createTestPayment,
} = require('@condo/domains/acquiring/utils/testSchema')
const {
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAuthenticationErrorToObj,
    expectToThrowValidationFailureError,
} = require('@condo/domains/common/utils/testSchema')
const { MULTIPAYMENT_ERROR_STATUS } = require('@condo/domains/acquiring/constants/payment')
const {
    MULTIPAYMENT_EMPTY_PAYMENTS,
    MULTIPAYMENT_TOO_BIG_IMPLICIT_FEE,
    MULTIPAYMENT_NO_RECEIPT_PAYMENTS,
    MULTIPAYMENT_MULTIPLE_CURRENCIES,
    MULTIPAYMENT_NOT_UNIQUE_RECEIPTS,
    MULTIPAYMENT_TOTAL_AMOUNT_MISMATCH,
    MULTIPAYMENT_MULTIPLE_ACQUIRING_INTEGRATIONS,
    MULTIPAYMENT_ACQUIRING_INTEGRATIONS_MISMATCH,
    MULTIPAYMENT_CANNOT_GROUP_RECEIPTS,
} = require('@condo/domains/acquiring/constants/errors')
const Big = require('big.js')

describe('MultiPayment', () => {
    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const { payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)
                const paymentsIds = payments.map(payment => ({ id: payment.id }))

                expect(multiPayment).toBeDefined()
                expect(multiPayment).toHaveProperty(['integration', 'id'], acquiringIntegration.id)
                expect(multiPayment).toHaveProperty('payments')
                expect(multiPayment.payments).toEqual(expect.arrayContaining(paymentsIds))
            })
            test('support can\'t', async () => {
                const support = await makeClientWithSupportUser()
                const { payments, acquiringIntegration, client } = await makePayerAndPayments()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestMultiPayment(support, payments, client.user, acquiringIntegration)
                })
            })
            test('user can\'t', async () => {
                const { payments, acquiringIntegration, client } = await makePayerAndPayments()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestMultiPayment(client, payments, client.user, acquiringIntegration)
                })
            })
            test('anonymous can\'t', async () => {
                const anonymousClient = await makeClient()
                const { payments, acquiringIntegration, client } = await makePayerAndPayments()
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestMultiPayment(anonymousClient, payments, client.user, acquiringIntegration)
                })
            })
        })
        describe('read', () => {
            test('admin can', async () => {
                const { payments, acquiringIntegration, client, admin } = await makePayerAndPayments()
                await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                const multiPayments = await MultiPayment.getAll(admin)
                expect(multiPayments).toBeDefined()
                expect(multiPayments).not.toHaveLength(0)
            })
            test('support can', async () => {
                const { payments, acquiringIntegration, client, admin } = await makePayerAndPayments()
                await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                const support = await makeClientWithSupportUser()
                const multiPayments = await MultiPayment.getAll(support)
                expect(multiPayments).toBeDefined()
                expect(multiPayments).not.toHaveLength(0)
            })
            describe('user', () => {
                test('user can see only it\'s own multipayments', async () => {
                    const { admin, payments: firstPayments, acquiringIntegration: firstAcquiringIntegration, client: firstClient } = await makePayerAndPayments()
                    const { payments: secondPayments, client: secondClient, acquiringIntegration: secondAcquiringIntegration } = await makePayerAndPayments()
                    const [firstMultiPayment] = await createTestMultiPayment(admin, firstPayments, firstClient.user, firstAcquiringIntegration)
                    const [secondMultiPayment] = await createTestMultiPayment(admin, secondPayments, secondClient.user, secondAcquiringIntegration)
                    let { data: { objs: firstMultiPayments } } = await MultiPayment.getAll(firstClient, {}, { raw:true })
                    expect(firstMultiPayments).toBeDefined()
                    expect(firstMultiPayments).toHaveLength(1)
                    expect(firstMultiPayments).toHaveProperty(['0', 'id'], firstMultiPayment.id)
                    let { data: { objs: secondMultiPayments } } = await MultiPayment.getAll(secondClient, {}, { raw:true })
                    expect(secondMultiPayments).toBeDefined()
                    expect(secondMultiPayments).toHaveLength(1)
                    expect(secondMultiPayments).toHaveProperty(['0', 'id'], secondMultiPayment.id)
                })
                test('integration account can see only multipayments linked to it\'s integration', async () => {
                    const { admin, payments, acquiringIntegration: firstIntegration, client, billingIntegration } = await makePayerAndPayments()
                    const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, firstIntegration)
                    const [secondIntegration] = await createTestAcquiringIntegration(admin, [billingIntegration])

                    const firstIntegrationClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    const secondIntegrationClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    await createTestAcquiringIntegrationAccessRight(admin, firstIntegration, firstIntegrationClient.user)
                    await createTestAcquiringIntegrationAccessRight(admin, secondIntegration, secondIntegrationClient.user)

                    let { data: { objs: firstMultiPayments } } = await MultiPayment.getAll(firstIntegrationClient, {}, { raw:true })
                    expect(firstMultiPayments).toBeDefined()
                    expect(firstMultiPayments).toHaveLength(1)
                    expect(firstMultiPayments).toHaveProperty(['0', 'id'], multiPayment.id)
                    let { data: { objs: secondMultiPayments } } = await MultiPayment.getAll(secondIntegrationClient, {}, { raw:true })
                    expect(secondMultiPayments).toBeDefined()
                    expect(secondMultiPayments).toHaveLength(0)
                })
            })
            test('anonymous can\'t', async () => {
                const anonymousClient = await makeClient()
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await MultiPayment.getAll(anonymousClient)
                })
            })
        })
        describe('update', () => {
            test('admin can', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)
                const payload = {}
                const [updatedMultiPayment] = await updateTestMultiPayment(admin, multiPayment.id, payload)
                expect(updatedMultiPayment).toBeDefined()
                expect(updatedMultiPayment).toHaveProperty('status', MULTIPAYMENT_ERROR_STATUS)

            })
            test('support can\'t', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                const support = await makeClientWithSupportUser()
                const payload = {}
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestMultiPayment(support, multiPayment.id, payload)
                })
            })
            describe('user',  () => {
                test('acquiring integration account can change it\'s own multipayments', async () => {
                    const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                    const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                    const integrationClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    await createTestAcquiringIntegrationAccessRight(admin, acquiringIntegration, integrationClient.user)
                    // TODO(DOMA-1554): Fix this test
                    const [_, updatedMultiPaymentAttrs] = await updateTestMultiPayment(integrationClient, multiPayment.id, {
                        status: MULTIPAYMENT_ERROR_STATUS,
                    }, { raw:true })
                    expect(updatedMultiPaymentAttrs).toBeDefined()
                    expect(updatedMultiPaymentAttrs).toHaveProperty('status', MULTIPAYMENT_ERROR_STATUS)
                })
                test('user can\'t', async () => {
                    const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                    const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                    const payload = {}
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestMultiPayment(client, multiPayment.id, payload)
                    })
                })
            })
            test('anonymous can\'t', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                const anonymousClient = await makeClient()
                const payload = {}
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestMultiPayment(anonymousClient, multiPayment.id, payload)
                })
            })
        })
        describe('delete',  () => {
            test('admin can\'t', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MultiPayment.delete(admin, multiPayment.id)
                })
            })
            test('support can\'t', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                const support = await makeClientWithSupportUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MultiPayment.delete(support, multiPayment.id)
                })
            })

            test('user can\'t', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MultiPayment.delete(client, multiPayment.id)
                })
            })

            test('anonymous can\'t', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                const anonymousClient = await makeClient()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MultiPayment.delete(anonymousClient, multiPayment.id)
                })
            })
        })
    })
    describe('Validation tests', () => {
        describe('Fields validation', () => {
            test('Should have correct dv field (=== 1)', async () => {
                const { payments, acquiringIntegration, client, admin } = await makePayerAndPayments()
                await expectToThrowValidationFailureError(async () => {
                    await createTestMultiPayment(admin, payments, client.user, acquiringIntegration, {
                        dv: 2,
                    })
                }, 'unknownDataVersion')
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)
                await expectToThrowValidationFailureError(async () => {
                    await updateTestMultiPayment(admin, multiPayment.id, {
                        dv: 2,
                    })
                }, 'unknownDataVersion')
            })
            test('Payments should not be empty', async () => {
                const { payments, acquiringIntegration, client, admin } = await makePayerAndPayments()
                await expectToThrowValidationFailureError(async () => {
                    await createTestMultiPayment(admin, payments, client.user, acquiringIntegration, {
                        payments: { disconnectAll: true },
                    })
                }, MULTIPAYMENT_EMPTY_PAYMENTS)
            })
            describe('Should check for non-negative money fields', () => {
                const cases = [
                    ['explicitFee', '-0.01'], ['explicitFee', '-30'], ['explicitFee', '-10.50'],
                    ['serviceFee', '-0.01'], ['serviceFee', '-30'], ['serviceFee', '-10.50'],
                ]
                test.each(cases)('%p: %p', async (field, amount) => {
                    const { payments, acquiringIntegration, client, admin } = await makePayerAndPayments()
                    await expectToThrowValidationFailureError(async () => {
                        await createTestMultiPayment(admin, payments, client.user, acquiringIntegration, {
                            [field]: amount,
                        })
                    }, 'must be greater')
                })
            })
            test('Implicit fee cannot be greater than amountWithoutExplicitFee', async () => {
                const { admin, organization, billingReceipts, acquiringContext, client, acquiringIntegration  } = await makePayer()
                const [payment] = await createTestPayment(admin, organization, billingReceipts[0], acquiringContext, {
                    amount: '100',
                })
                await expectToThrowValidationFailureError(async () => {
                    await createTestMultiPayment(admin, [payment], client.user, acquiringIntegration, {
                        implicitFee: '105',
                    })
                }, MULTIPAYMENT_TOO_BIG_IMPLICIT_FEE)
            })
        })
        describe('Model validation', () => {
            describe('All linked payments should have', () => {
                test('Billing receipt', async () => {
                    const { admin, organization, billingReceipts, acquiringContext, client, acquiringIntegration } = await makePayer()
                    const [firstPayment] = await createTestPayment(admin, organization, billingReceipts[0], acquiringContext, {
                        amount: '100.00',
                        implicitFee: null,
                    })
                    const [secondPayment] = await createTestPayment(admin, organization, null, acquiringContext, {
                        amount: '100.00',
                        implicitFee: null,
                    })
                    await expectToThrowValidationFailureError(async () => {
                        await createTestMultiPayment(admin, [firstPayment, secondPayment], client.user, acquiringIntegration)
                    }, MULTIPAYMENT_NO_RECEIPT_PAYMENTS)
                })
                test('Same currency code', async () => {
                    const { admin, organization, billingReceipts, acquiringContext, client, acquiringIntegration } = await makePayer(2)
                    const [firstPayment] = await createTestPayment(admin, organization, billingReceipts[0], acquiringContext)
                    const [secondPayment] = await createTestPayment(admin, organization, billingReceipts[1], acquiringContext, {
                        currencyCode: 'USD',
                    })
                    await expectToThrowValidationFailureError(async () => {
                        await createTestMultiPayment(admin, [firstPayment, secondPayment], client.user, acquiringIntegration)
                    }, MULTIPAYMENT_MULTIPLE_CURRENCIES)
                })
                test('Unique receipts', async () => {
                    const { admin, organization, billingReceipts, acquiringContext, client, acquiringIntegration } = await makePayer()
                    const [firstPayment] = await createTestPayment(admin, organization, billingReceipts[0], acquiringContext)
                    const [secondPayment] = await createTestPayment(admin, organization, billingReceipts[0], acquiringContext)
                    await expectToThrowValidationFailureError(async () => {
                        await createTestMultiPayment(admin, [firstPayment, secondPayment], client.user, acquiringIntegration)
                    }, MULTIPAYMENT_NOT_UNIQUE_RECEIPTS)
                })
                test('Matching amount', async () => {
                    const { admin, organization, billingReceipts, acquiringContext, client, acquiringIntegration } = await makePayer(2)
                    const [firstPayment] = await createTestPayment(admin, organization, billingReceipts[0], acquiringContext)
                    const [secondPayment] = await createTestPayment(admin, organization, billingReceipts[1], acquiringContext)
                    await expectToThrowValidationFailureError(async () => {
                        await createTestMultiPayment(admin, [firstPayment, secondPayment], client.user, acquiringIntegration, {
                            amountWithoutExplicitFee: Big(billingReceipts[0].toPay).plus(Big(billingReceipts[1].toPay)).plus(Big(50)).toString(),
                        })
                    }, MULTIPAYMENT_TOTAL_AMOUNT_MISMATCH)
                })
                test('Same acquiring', async () => {
                    const { admin, payments, client, acquiringIntegration } = await makePayerAndPayments()
                    const { payments: secondPayments } = await makePayerAndPayments()
                    await expectToThrowValidationFailureError(async () => {
                        await createTestMultiPayment(admin, [payments[0], secondPayments[0]], client.user, acquiringIntegration)
                    }, MULTIPAYMENT_MULTIPLE_ACQUIRING_INTEGRATIONS)
                })
            })
            test('Cannot accept payments with different acquiring', async () => {
                const { billingIntegration, admin, payments, client } = await makePayerAndPayments()
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                await expectToThrowValidationFailureError(async () => {
                    await createTestMultiPayment(admin, payments, client.user, integration)
                }, MULTIPAYMENT_ACQUIRING_INTEGRATIONS_MISMATCH)
            })
            test('Cannot accept multiple receipts if acquiring cannot group receipts', async () => {
                const { admin, payments, client, acquiringIntegration } = await makePayerAndPayments(2)
                await expectToThrowValidationFailureError(async () => {
                    await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)
                }, MULTIPAYMENT_CANNOT_GROUP_RECEIPTS)
            })
        })
    })
    describe('real-life cases', () => {
        // TODO(DOMA-1452) write tests

        test('mobile resident can\'t see his sensitive data in his own MultiPayments', async () => {
            const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
            const [createdMultiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)
            // We use raw: true because when using field access, all fields that are not permitted result in error which stops the test
            let { data: { objs: multiPayments } } = await MultiPayment.getAll(client, {}, { raw: true })
            expect(multiPayments).toBeDefined()
            expect(multiPayments).toHaveLength(1)
            const retrievedMultiPayment = multiPayments[0]
            expect(retrievedMultiPayment.id).toBe(createdMultiPayment.id)
            expect(retrievedMultiPayment.implicitFee).toBeNull()
            expect(retrievedMultiPayment.transactionId).toBeNull()
            expect(retrievedMultiPayment.meta).toBeNull()
        })
    })
})
