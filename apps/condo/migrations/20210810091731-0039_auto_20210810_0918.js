// auto generated by kmigrator
// KMIGRATOR:0039_auto_20210810_0918:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi42IG9uIDIwMjEtMDgtMTAgMDk6MTgKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAwMzhfYXV0b18yMDIxMDgwOV8xMjIyJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdvcmdhbml6YXRpb25lbXBsb3llZXJvbGUnLAogICAgICAgICAgICBuYW1lPSdjYW5CZUFzc2lnbmVkQXNFeGVjdXRvcicsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Cb29sZWFuRmllbGQoZGVmYXVsdD1UcnVlKSwKICAgICAgICAgICAgcHJlc2VydmVfZGVmYXVsdD1GYWxzZSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J29yZ2FuaXphdGlvbmVtcGxveWVlcm9sZScsCiAgICAgICAgICAgIG5hbWU9J2NhbkJlQXNzaWduZWRBc1Jlc3BvbnNpYmxlJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChkZWZhdWx0PVRydWUpLAogICAgICAgICAgICBwcmVzZXJ2ZV9kZWZhdWx0PUZhbHNlLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nb3JnYW5pemF0aW9uZW1wbG95ZWVyb2xlaGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2NhbkJlQXNzaWduZWRBc0V4ZWN1dG9yJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nb3JnYW5pemF0aW9uZW1wbG95ZWVyb2xlaGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2NhbkJlQXNzaWduZWRBc1Jlc3BvbnNpYmxlJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canBeAssignedAsExecutor to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" ADD COLUMN "canBeAssignedAsExecutor" boolean DEFAULT true NOT NULL;
ALTER TABLE "OrganizationEmployeeRole" ALTER COLUMN "canBeAssignedAsExecutor" DROP DEFAULT;
--
-- Add field canBeAssignedAsResponsible to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" ADD COLUMN "canBeAssignedAsResponsible" boolean DEFAULT true NOT NULL;
ALTER TABLE "OrganizationEmployeeRole" ALTER COLUMN "canBeAssignedAsResponsible" DROP DEFAULT;
--
-- Add field canBeAssignedAsExecutor to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" ADD COLUMN "canBeAssignedAsExecutor" boolean NULL;
--
-- Add field canBeAssignedAsResponsible to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" ADD COLUMN "canBeAssignedAsResponsible" boolean NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canBeAssignedAsResponsible to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" DROP COLUMN "canBeAssignedAsResponsible" CASCADE;
--
-- Add field canBeAssignedAsExecutor to organizationemployeerolehistoryrecord
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" DROP COLUMN "canBeAssignedAsExecutor" CASCADE;
--
-- Add field canBeAssignedAsResponsible to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" DROP COLUMN "canBeAssignedAsResponsible" CASCADE;
--
-- Add field canBeAssignedAsExecutor to organizationemployeerole
--
ALTER TABLE "OrganizationEmployeeRole" DROP COLUMN "canBeAssignedAsExecutor" CASCADE;
COMMIT;

    `)
}