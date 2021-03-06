/**
 * This file is autogenerated by `createschema resident.Resident 'user:Relationship:User:CASCADE; organization:Relationship:Organization:PROTECT; property:Relationship:Property:PROTECT; billingAccount?:Relationship:BillingAccount:SET_NULL; unitName:Text;'`
 * In most cases you should not change it by hands. And please don't remove `AUTOGENERATE MARKER`s
 */

const { Resident } = require('./Resident')
const { RegisterResidentService } = require('./RegisterResidentService')
const { ServiceConsumer } = require('./ServiceConsumer')
const { RegisterServiceConsumerService } = require('./RegisterServiceConsumerService')
/* AUTOGENERATE MARKER <REQUIRE> */

module.exports = {
    Resident,
    RegisterResidentService,
    ServiceConsumer,
    RegisterServiceConsumerService,
/* AUTOGENERATE MARKER <EXPORTS> */
}
