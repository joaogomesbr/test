// auto generated by kmigrator
// KMIGRATOR:0085_auto_20211126_0756:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi44IG9uIDIwMjEtMTEtMjYgMDc6NTYKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAwODRfYXV0b18yMDIxMTEyNV8xMzI2JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5naW50ZWdyYXRpb24nLAogICAgICAgICAgICBuYW1lPSdhdmFpbGFibGVPcHRpb25zJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkpTT05GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmlsbGluZ2ludGVncmF0aW9uaGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2F2YWlsYWJsZU9wdGlvbnMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuSlNPTkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5naW50ZWdyYXRpb25vcmdhbml6YXRpb25jb250ZXh0JywKICAgICAgICAgICAgbmFtZT0naW50ZWdyYXRpb25PcHRpb24nLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5naW50ZWdyYXRpb25vcmdhbml6YXRpb25jb250ZXh0aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2ludGVncmF0aW9uT3B0aW9uJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field availableOptions to billingintegration
--
ALTER TABLE "BillingIntegration" ADD COLUMN "availableOptions" jsonb NULL;
--
-- Add field availableOptions to billingintegrationhistoryrecord
--
ALTER TABLE "BillingIntegrationHistoryRecord" ADD COLUMN "availableOptions" jsonb NULL;
--
-- Add field integrationOption to billingintegrationorganizationcontext
--
ALTER TABLE "BillingIntegrationOrganizationContext" ADD COLUMN "integrationOption" text NULL;
--
-- Add field integrationOption to billingintegrationorganizationcontexthistoryrecord
--
ALTER TABLE "BillingIntegrationOrganizationContextHistoryRecord" ADD COLUMN "integrationOption" text NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field integrationOption to billingintegrationorganizationcontexthistoryrecord
--
ALTER TABLE "BillingIntegrationOrganizationContextHistoryRecord" DROP COLUMN "integrationOption" CASCADE;
--
-- Add field integrationOption to billingintegrationorganizationcontext
--
ALTER TABLE "BillingIntegrationOrganizationContext" DROP COLUMN "integrationOption" CASCADE;
--
-- Add field availableOptions to billingintegrationhistoryrecord
--
ALTER TABLE "BillingIntegrationHistoryRecord" DROP COLUMN "availableOptions" CASCADE;
--
-- Add field availableOptions to billingintegration
--
ALTER TABLE "BillingIntegration" DROP COLUMN "availableOptions" CASCADE;
COMMIT;

    `)
}
