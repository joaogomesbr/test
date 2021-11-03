/**
 * Generated by `createservice acquiring.RegisterMultiPaymentService`
 */

const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { expectToThrowAuthenticationErrorToObjects } = require('@condo/domains/common/utils/testSchema')

const { registerMultiPaymentByTestClient } = require('@condo/domains/acquiring/utils/testSchema')
 
describe('RegisterMultiPaymentService', () => {
    test('user: execute', async () => {
        const client = await makeClient()  // TODO(codegen): use truly useful client!
        const payload = {}  // TODO(codegen): change the 'user: update RegisterMultiPaymentService' payload
        const [data, attrs] = await registerMultiPaymentByTestClient(client, payload)
        // TODO(codegen): write user expect logic
        throw new Error('Not implemented yet')
    })
 
    test('anonymous: execute', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationErrorToObjects(async () => {
            await registerMultiPaymentByTestClient(client)
        })
    })
 
    test('admin: execute', async () => {
        const admin = await makeLoggedInAdminClient()
        const payload = {}  // TODO(codegen): change the 'user: update RegisterMultiPaymentService' payload
        const [data, attrs] = await registerMultiPaymentByTestClient(admin, payload)
        // TODO(codegen): write admin expect logic
        throw new Error('Not implemented yet')
    })
})