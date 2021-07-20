/**
 * This file is autogenerated by `createschema organization.Organization 'country:Select:ru,en; name:Text; description?:Text; avatar?:File; meta:Json; employees:Relationship:OrganizationEmployee:CASCADE; statusTransitions:Json; defaultEmployeeRoleStatusTransitions:Json' --force`
 * In most cases you should not change it by hands. And please don't remove `AUTOGENERATE MARKER`s
 */

const { Organization } = require('./Organization')
const { OrganizationEmployee } = require('./OrganizationEmployee')
const { OrganizationEmployeeRole } = require('./OrganizationEmployeeRole')
const { RegisterNewOrganizationService } = require('./RegisterNewOrganizationService')
const { InviteNewOrganizationEmployeeService } = require('./InviteNewOrganizationEmployeeService')
const { AcceptOrRejectOrganizationInviteService } = require('./AcceptOrRejectOrganizationInviteService')
const { OrganizationLink } = require('./OrganizationLink')
const { OrganizationLinkEmployeeAccess } = require('./OrganizationLinkEmployeeAccess')
/* AUTOGENERATE MARKER <REQUIRE> */

module.exports = {
    Organization,
    OrganizationEmployee,
    OrganizationEmployeeRole,
    RegisterNewOrganizationService,
    InviteNewOrganizationEmployeeService,
    AcceptOrRejectOrganizationInviteService,
    OrganizationLink,
    OrganizationLinkEmployeeAccess,
/* AUTOGENERATE MARKER <EXPORTS> */
}
