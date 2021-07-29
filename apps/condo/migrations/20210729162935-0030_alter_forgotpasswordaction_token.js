// auto generated by kmigrator
// KMIGRATOR:0030_alter_forgotpasswordaction_token:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi41IG9uIDIwMjEtMDctMjkgMTE6MjkNCg0KZnJvbSBkamFuZ28uZGIgaW1wb3J0IG1pZ3JhdGlvbnMsIG1vZGVscw0KDQoNCmNsYXNzIE1pZ3JhdGlvbihtaWdyYXRpb25zLk1pZ3JhdGlvbik6DQoNCiAgICBkZXBlbmRlbmNpZXMgPSBbDQogICAgICAgICgnX2RqYW5nb19zY2hlbWEnLCAnMDAyOV9tZXJnZV8yMDIxMDcyOV8wODA2JyksDQogICAgXQ0KDQogICAgb3BlcmF0aW9ucyA9IFsNCiAgICAgICAgbWlncmF0aW9ucy5BbHRlckZpZWxkKA0KICAgICAgICAgICAgbW9kZWxfbmFtZT0nZm9yZ290cGFzc3dvcmRhY3Rpb24nLA0KICAgICAgICAgICAgbmFtZT0ndG9rZW4nLA0KICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZCh1bmlxdWU9VHJ1ZSksDQogICAgICAgICksDQogICAgXQ0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field token on forgotpasswordaction
--
ALTER TABLE "ForgotPasswordAction" ADD CONSTRAINT "ForgotPasswordAction_token_9a0cc9b4_uniq" UNIQUE ("token");
CREATE INDEX "ForgotPasswordAction_token_9a0cc9b4_like" ON "ForgotPasswordAction" ("token" text_pattern_ops);
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field token on forgotpasswordaction
--
DROP INDEX IF EXISTS "ForgotPasswordAction_token_9a0cc9b4_like";
COMMIT;

    `)
}
