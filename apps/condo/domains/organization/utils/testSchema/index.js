/**
 * Generated by `createschema organization.Organization 'country:Select:ru,en; name:Text; description?:Text; avatar?:File; meta:Json; employees:Relationship:OrganizationEmployee:CASCADE; statusTransitions:Json; defaultEmployeeRoleStatusTransitions:Json' --force`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')
const {makeClientWithProperty} = require("@condo/domains/property/utils/testSchema");
const {createTestProperty} = require("@condo/domains/property/utils/testSchema");
const { DEFAULT_ENGLISH_COUNTRY, RUSSIA_COUNTRY } = require ('@condo/domains/common/constants/countries');
const { makeClientWithNewRegisteredAndLoggedInUser, registerNewUser } = require ('@condo/domains/user/utils/testSchema');
const { makeLoggedInAdminClient, makeLoggedInClient } = require ('@core/keystone/test.utils');

const { generateGQLTestUtils } = require('@condo/domains/common/utils/codegeneration/generate.test.utils')
const { Organization: OrganizationGQL, OrganizationEmployee: OrganizationEmployeeGQL, OrganizationEmployeeRole: OrganizationEmployeeRoleGQL, REGISTER_NEW_ORGANIZATION_MUTATION } = require('@condo/domains/organization/gql')
const { OrganizationLink: OrganizationLinkGQL } = require('@condo/domains/organization/gql');
/* AUTOGENERATE MARKER <IMPORT> */

const OrganizationEmployeeRole = generateGQLTestUtils(OrganizationEmployeeRoleGQL)
const Organization = generateGQLTestUtils(OrganizationGQL)
const OrganizationEmployee = generateGQLTestUtils(OrganizationEmployeeGQL)
const OrganizationLink = generateGQLTestUtils(OrganizationLinkGQL)
/* AUTOGENERATE MARKER <CONST> */

async function makeClientWithOrganization (extraAttrs = {}) {
    const client = await makeLoggedInClient()
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric (8) }
    const country = DEFAULT_ENGLISH_COUNTRY
    const name = faker.company.companyName()
    const description = faker.company.catchPhrase()
    const meta = {
        dv: 1,
        inn: faker.random.alphaNumeric(10),
        kpp: faker.random.alphaNumeric(9),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
        street: faker.address.streetName(),
        number: faker.address.secondaryAddress(),
        country: faker.address.country(),
    }
    const attrs = {
        dv: 1,
        sender,
        country,
        name,
        description,
        meta,
        ...extraAttrs,
    }
    const { data: { obj } } = await client.mutate(REGISTER_NEW_ORGANIZATION_MUTATION, {
        data: attrs
    })
    client.organization = obj

    return client
}

async function createTestOrganization (client, extraAttrs = {}) {
    if (!client) throw new Error ('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric (8) }
    const country = DEFAULT_ENGLISH_COUNTRY
    const name = faker.company.companyName ()
    const description = faker.company.catchPhrase ()
    const meta = {
        dv: 1,
        inn: faker.random.alphaNumeric(10),
        kpp: faker.random.alphaNumeric(9),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
        street: faker.address.streetName(),
        number: faker.address.secondaryAddress(),
        country: faker.address.country(),
    }

    const attrs = {
        dv: 1,
        sender,
        country,
        name,
        description,
        meta,
        ...extraAttrs,
    }
    const obj = await Organization.create(client, attrs)
    return [obj, attrs]
}

async function updateTestOrganization (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const meta = {
        inn: faker.random.alphaNumeric(10),
        kpp: faker.random.alphaNumeric(9),
        city: faker.address.city(),
        zipCode: faker.address.zipCode(),
        street: faker.address.streetName(),
        number: faker.address.secondaryAddress(),
    }

    const attrs = {
        dv: 1,
        sender,
        meta,
        name: faker.company.companyName(),
        description: faker.company.catchPhrase(),
        country: RUSSIA_COUNTRY,
        ...extraAttrs,
    }
    const obj = await Organization.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestOrganizationEmployee (client, organization, user, role, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    if (!user || !user.id) throw new Error('no user.id')
    if (!role || !role.id) throw new Error('no role.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        email: faker.internet.email(),
        organization: { connect: { id: organization.id } },
        user: { connect: { id: user.id } },
        role: { connect: { id: role.id } },
        ...extraAttrs,
    }
    const obj = await OrganizationEmployee.create(client, attrs)
    return [obj, attrs]
}

async function updateTestOrganizationEmployee (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await OrganizationEmployee.update(client, id, attrs)
    return [obj, attrs]
}

async function softDeleteTestOrganizationEmployee (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        deletedAt: 'true',
        ...extraAttrs,
    }

    return updateTestOrganizationEmployee(client, id, attrs)
}

async function createTestOrganizationEmployeeRole (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.random.alphaNumeric(8),
        description: faker.random.words(8),
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    const obj = await OrganizationEmployeeRole.create(client, attrs)
    return [obj, attrs]
}

/**
 * Simplifies creating series of instances
 */
async function makeAdminClientWithRegisteredOrganizationWithRoleWithEmployee () {
    const admin = await makeLoggedInAdminClient()
    const [organization] = await createTestOrganization(admin)
    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
    const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
    const [employee] = await createTestOrganizationEmployee(admin, organization, userClient.user, role)
    return { employee, role, organization, admin }
}

async function updateTestOrganizationEmployeeRole (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.random.alphaNumeric(8),
        ...extraAttrs,
    }
    const obj = await OrganizationEmployeeRole.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestOrganizationLink (client, from, to, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!from || !from.id) throw new Error('no from.id')
    if (!to || !to.id) throw new Error('no to.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        from: { connect: { id: from.id } },
        to: { connect: { id: to.id } },
        ...extraAttrs,
    }
    const obj = await OrganizationLink.create(client, attrs)
    return [obj, attrs]
}

async function updateTestOrganizationLink (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestOrganizationLink logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await OrganizationLink.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestOrganizationWithAccessToAnotherOrganization () {
    const admin = await makeLoggedInAdminClient()
    // createClientWithProperty creates an employee inside himself, this behavior is not needed here
    const clientFrom = await makeClientWithNewRegisteredAndLoggedInUser()
    const [organizationFrom] = await createTestOrganization(admin)
    const [propertyFrom] = await createTestProperty(admin, organizationFrom)
    const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom)
    const [employeeFrom] = await createTestOrganizationEmployee(admin, organizationFrom, clientFrom.user, role)

    const clientTo = await makeClientWithProperty()
    const [organizationTo] = await createTestOrganization(admin)
    const [propertyTo] = await createTestProperty(admin, organizationTo)
    const [employeeTo] = await createTestOrganizationEmployee(admin, organizationTo, clientTo.user, role)

    const [link] = await createTestOrganizationLink(admin, organizationFrom, organizationTo)

    return {
        clientFrom, propertyFrom, employeeFrom, organizationFrom,
        clientTo, propertyTo, employeeTo, organizationTo,
        link,
    }
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    Organization,
    OrganizationEmployee,
    OrganizationEmployeeRole,
    createTestOrganizationEmployeeRole,
    updateTestOrganizationEmployeeRole,
    createTestOrganization,
    updateTestOrganization,
    createTestOrganizationEmployee,
    softDeleteTestOrganizationEmployee,
    makeAdminClientWithRegisteredOrganizationWithRoleWithEmployee,
    updateTestOrganizationEmployee, createTestOrganizationWithAccessToAnotherOrganization,
    OrganizationLink, createTestOrganizationLink, updateTestOrganizationLink,
    makeClientWithOrganization,
}

    /* AUTOGENERATE MARKER <EXPORTS> */
