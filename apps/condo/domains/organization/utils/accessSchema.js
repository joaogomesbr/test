import { OrganizationLink } from './serverSchema'

const { getByCondition } = require('@core/keystone/schema')

async function checkOrganizationPermission (userId, organizationId, permission) {
    if (!userId || !organizationId) return false
    const employee = await getByCondition('OrganizationEmployee', {
        organization: { id: organizationId },
        user: { id: userId },
        deletedAt: null,
    })

    if (!employee || !employee.role) {
        return false
    }

    if (employee.isBlocked) {
        return false
    }

    if (employee.deletedAt !== null) {
        return false
    }

    const employeeRole = await getByCondition('OrganizationEmployeeRole', {
        id: employee.role,
        organization: { id: organizationId },
    })
    if (!employeeRole) return false
    return employeeRole[permission] || false
}

async function checkRelatedOrganizationPermission (userId, organizationId, permission) {
    if (!userId || !organizationId) return false

    const organizationLink = await getByCondition('OrganizationLink', {
        from: { employees_some: { user: { id: userId }, isBlocked: false, deletedAt: null } },
        to: { id: organizationId },
    })

    const organizationLinkEmployeeAccess = await getByCondition('OrganizationLinkEmployeeAccess', {
        link: { id: organizationLink.id },
        employee: { user: { id: userId } },
    })

    if (!organizationLinkEmployeeAccess) return false
    return organizationLinkEmployeeAccess[permission] || false
}


async function checkUserBelongsToOrganization (userId, organizationId) {
    if (!userId || !organizationId) return false
    const employee = await getByCondition('OrganizationEmployee', {
        organization: { id: organizationId },
        user: { id: userId },
        isAccepted: true,
        isBlocked: false,
        isRejected: false,
    })

    if (!employee) {
        return false
    }

    if (employee.isBlocked) {
        return false
    }

    return employee.deletedAt === null
}

module.exports = {
    checkOrganizationPermission,
    checkUserBelongsToOrganization,
    checkRelatedOrganizationPermission,
}
