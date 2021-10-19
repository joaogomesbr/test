// auto generated by kmigrator
// KMIGRATOR:0069_residenthistoryrecord_paymentcategories:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi40IG9uIDIwMjEtMTAtMTkgMTk6MDMKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAwNjhfYXV0b18yMDIxMTAxOF8yMTA3JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdyZXNpZGVudGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdwYXltZW50Q2F0ZWdvcmllcycsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5KU09ORmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field paymentCategories to residenthistoryrecord
--
ALTER TABLE "ResidentHistoryRecord" ADD COLUMN "paymentCategories" jsonb NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field paymentCategories to residenthistoryrecord
--
ALTER TABLE "ResidentHistoryRecord" DROP COLUMN "paymentCategories" CASCADE;
COMMIT;

    `)
}
