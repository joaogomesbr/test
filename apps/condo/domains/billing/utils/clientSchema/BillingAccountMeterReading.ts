/**
 * Generated by `createschema billing.BillingAccountMeterReading 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; account:Relationship:BillingAccount:CASCADE; meter:Relationship:BillingAccountMeter:CASCADE; period:CalendarDay; value1:Integer; value2:Integer; value3:Integer; date:DateTimeUtc; raw:Json; meta:Json' --force`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { BillingAccountMeterReading as BillingAccountMeterReadingGQL } from '@condo/domains/billing/gql'
import { BillingAccountMeterReading, BillingAccountMeterReadingUpdateInput, QueryAllBillingAccountMeterReadingsArgs } from '@app/condo/schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'context', 'importId', 'property', 'account', 'meter', 'period', 'value1', 'value2', 'value3', 'date', 'raw', 'meta']
const RELATIONS = ['context', 'property', 'account', 'meter']

export interface IBillingAccountMeterReadingUIState extends BillingAccountMeterReading {
    id: string
    // TODO(codegen): write IBillingAccountMeterReadingUIState or extends it from
}

function convertToUIState (item: BillingAccountMeterReading): IBillingAccountMeterReadingUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IBillingAccountMeterReadingUIState
}

export interface IBillingAccountMeterReadingFormState {
    id?: undefined
    // TODO(codegen): write IBillingAccountMeterReadingUIFormState or extends it from
}

function convertToUIFormState (state: IBillingAccountMeterReadingUIState): IBillingAccountMeterReadingFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IBillingAccountMeterReadingFormState
}

function convertToGQLInput (state: IBillingAccountMeterReadingFormState): BillingAccountMeterReadingUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? { connect: { id: (attrId || state[attr]) } } : state[attr]
    }
    return result
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
} = generateReactHooks<BillingAccountMeterReading, BillingAccountMeterReadingUpdateInput, IBillingAccountMeterReadingFormState, IBillingAccountMeterReadingUIState, QueryAllBillingAccountMeterReadingsArgs>(BillingAccountMeterReadingGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}
