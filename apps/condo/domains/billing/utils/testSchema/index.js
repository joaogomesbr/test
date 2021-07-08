/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const { makeLoggedInAdminClient } = require("@core/keystone/test.utils");
const {
    createTestOrganizationEmployee,
    createTestOrganizationEmployeeRole
} = require("@condo/domains/organization/utils/testSchema");
const { makeClientWithNewRegisteredAndLoggedInUser } = require("@condo/domains/user/utils/testSchema");
const faker = require('faker')
const { makeClient } = require('@core/keystone/test.utils')
const { registerNewOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { createTestOrganization } = require("@condo/domains/organization/utils/testSchema");
const { makeLoggedInClient, registerNewUser } = require('@condo/domains/user/utils/testSchema')
const { generateGQLTestUtils } = require('@condo/domains/common/utils/codegeneration/generate.test.utils')
const { BillingIntegration: BillingIntegrationGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationAccessRight: BillingIntegrationAccessRightGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationOrganizationContext: BillingIntegrationOrganizationContextGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationLog: BillingIntegrationLogGQL } = require('@condo/domains/billing/gql')
const { BillingProperty: BillingPropertyGQL } = require('@condo/domains/billing/gql')
const { BillingAccount: BillingAccountGQL } = require('@condo/domains/billing/gql')
const { BillingMeterResource: BillingMeterResourceGQL } = require('@condo/domains/billing/gql')
const { BillingAccountMeter: BillingAccountMeterGQL } = require('@condo/domains/billing/gql')
const { BillingAccountMeterReading: BillingAccountMeterReadingGQL } = require('@condo/domains/billing/gql')
const { BillingReceipt: BillingReceiptGQL } = require('@condo/domains/billing/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const BillingIntegration = generateGQLTestUtils(BillingIntegrationGQL)
const BillingIntegrationAccessRight = generateGQLTestUtils(BillingIntegrationAccessRightGQL)
const BillingIntegrationOrganizationContext = generateGQLTestUtils(BillingIntegrationOrganizationContextGQL)
const BillingIntegrationLog = generateGQLTestUtils(BillingIntegrationLogGQL)
const BillingProperty = generateGQLTestUtils(BillingPropertyGQL)
const BillingAccount = generateGQLTestUtils(BillingAccountGQL)
const BillingMeterResource = generateGQLTestUtils(BillingMeterResourceGQL)
const BillingAccountMeter = generateGQLTestUtils(BillingAccountMeterGQL)
const BillingAccountMeterReading = generateGQLTestUtils(BillingAccountMeterReadingGQL)
const BillingReceipt = generateGQLTestUtils(BillingReceiptGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestBillingIntegration (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const name = faker.company.companyName().replace(/ /, '-').toUpperCase() + ' TEST INTEGRATION'

    const attrs = {
        dv: 1,
        sender,
        name,
        ...extraAttrs,
    }
    const obj = await BillingIntegration.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingIntegration (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingIntegration.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingIntegrationAccessRight (client, integration, user, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!integration || !integration.id) throw new Error('no integration')
    if (!user || !user.id) throw new Error('no user')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        integration: { connect: { id: integration.id } },
        user: { connect: { id: user.id } },
        ...extraAttrs,
    }
    const obj = await BillingIntegrationAccessRight.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingIntegrationAccessRight (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingIntegrationAccessRight.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingIntegrationOrganizationContext (client, organization, integration, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    if (!integration || !integration.id) throw new Error('no integration.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const settings = { dv: 1, 'billing data source': 'https://api.dom.gosuslugi.ru/' }
    const state = { dv: 1 }

    const attrs = {
        dv: 1,
        sender,
        integration: { connect: { id: integration.id } },
        organization: { connect: { id: organization.id } },
        settings,
        state,
        ...extraAttrs,
    }
    const obj = await BillingIntegrationOrganizationContext.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingIntegrationOrganizationContext (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingIntegrationOrganizationContext.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingIntegrationLog (client, context, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const type = faker.lorem.words().replace(/[ ]/g, '_').toUpperCase()
    const message = faker.lorem.sentences()
    const meta = { username: faker.lorem.word(), server: faker.internet.url(), ip: faker.internet.ipv6() }

    const attrs = {
        dv: 1,
        sender,
        context: { connect: { id: context.id } },
        type, message, meta,
        ...extraAttrs,
    }
    const obj = await BillingIntegrationLog.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingIntegrationLog (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingIntegrationLog.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingProperty (client, context, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestBillingProperty logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        context: { connect: { id: context.id } },
        raw: { foo: faker.lorem.words() },
        globalId: faker.random.alphaNumeric(10),
        address: faker.lorem.words(),
        meta: {
            test: 123,
        },
        ...extraAttrs,
    }
    const obj = await BillingProperty.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingProperty (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestBillingProperty logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingProperty.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingAccount (client, context, property, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestBillingAccount logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        context: { connect: { id: context.id } },
        property: { connect: { id: property.id } },
        raw: { foo: faker.lorem.words() },
        number: faker.lorem.words(),
        unitName: faker.lorem.words(),
        meta: {
            dv: 1,
            test: 123,
        },
        ...extraAttrs,
    }
    const obj = await BillingAccount.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingAccount (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestBillingAccount logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingAccount.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingMeterResource (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestBillingMeterResource logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        name: faker.lorem.words(),
        ...extraAttrs,
    }
    const obj = await BillingMeterResource.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingMeterResource (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestBillingMeterResource logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingMeterResource.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingAccountMeter (client, context, property, account, resource, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestBillingAccountMeter logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        raw: { foo: faker.lorem.words() },
        meta: {
            dv: 1,
        },
        context: { connect: { id: context.id } },
        property: { connect: { id: property.id } },
        account: { connect: { id: account.id } },
        resource: { connect: { id: resource.id } },
        ...extraAttrs,
    }
    const obj = await BillingAccountMeter.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingAccountMeter (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestBillingAccountMeter logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingAccountMeter.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingAccountMeterReading (client, context, property, account, meter, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestBillingAccountMeterReading logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        context: { connect: { id: context.id } },
        property: { connect: { id: property.id } },
        account: { connect: { id: account.id } },
        meter: { connect: { id: meter.id } },
        raw: { foo: faker.lorem.words() },
        period: '2021-07-11',
        date: new Date(),
        value1: faker.datatype.number(),
        value2: faker.datatype.number(),
        value3: faker.datatype.number(),
        ...extraAttrs,
    }
    const obj = await BillingAccountMeterReading.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingAccountMeterReading (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestBillingAccountMeterReading logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingAccountMeterReading.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingReceipt (client, context, property, account, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestBillingReceipt logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        context: { connect: { id: context.id } },
        property: { connect: { id: property.id } },
        account: { connect: { id: account.id } },
        raw: { foo: faker.lorem.words() },
        period: '2021-07-11',
        toPay: "123",
        services: {
            dv: 1,
        },
        meta: {
            dv: 1,
        },
        ...extraAttrs,
    }
    const obj = await BillingReceipt.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingReceipt (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestBillingReceipt logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingReceipt.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

async function makeClientWithIntegrationAccess () {
    const admin = await makeLoggedInAdminClient()
    const [integration, integrationAttrs] = await createTestBillingIntegration(admin)

    const [user, userAttrs] = await registerNewUser(await makeClient())
    const client = await makeLoggedInClient(userAttrs)

    // add access
    await createTestBillingIntegrationAccessRight(admin, integration, user)

    client.user = user
    client.userAttrs = userAttrs
    client.integration = integration
    client.integrationAttrs = integrationAttrs
    return client
}

/**
 * Simplifies creating series of instances
 */

async function createContextWithOrganizationAndIntegrationAsAdmin() {
    const admin = await makeLoggedInAdminClient()
    const [integration] = await createTestBillingIntegration(admin)
    const [organization] = await registerNewOrganization(admin)
    const [context] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

    return { context, integration, organization }
}

async function createOrganizationIntegrationManager() {
    const admin = await makeLoggedInAdminClient()
    const [organization] = await createTestOrganization(admin)
    const [integration] = await createTestBillingIntegration(admin)
    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
        canManageIntegrations: true,
    })
    const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
    await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)
    return { organization, integration, managerUserClient }
}

module.exports = {
    BillingIntegration, createTestBillingIntegration, updateTestBillingIntegration,
    BillingIntegrationAccessRight, createTestBillingIntegrationAccessRight, updateTestBillingIntegrationAccessRight,
    makeClientWithIntegrationAccess,
    BillingIntegrationOrganizationContext, createTestBillingIntegrationOrganizationContext, updateTestBillingIntegrationOrganizationContext,
    BillingIntegrationLog, createTestBillingIntegrationLog, updateTestBillingIntegrationLog,
    BillingProperty, createTestBillingProperty, updateTestBillingProperty,
    BillingAccount, createTestBillingAccount, updateTestBillingAccount,
    BillingMeterResource, createTestBillingMeterResource, updateTestBillingMeterResource,
    BillingAccountMeter, createTestBillingAccountMeter, updateTestBillingAccountMeter,
    BillingAccountMeterReading, createTestBillingAccountMeterReading, updateTestBillingAccountMeterReading,
    BillingReceipt, createTestBillingReceipt, updateTestBillingReceipt,
    makeContextWithOrganizationAndIntegrationAsAdmin: createContextWithOrganizationAndIntegrationAsAdmin,
    makeOrganizationIntegrationManager: createOrganizationIntegrationManager
    /* AUTOGENERATE MARKER <EXPORTS> */
}


