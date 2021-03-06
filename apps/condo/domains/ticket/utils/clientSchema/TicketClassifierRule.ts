/**
 * Generated by `createschema ticket.TicketClassifierRule 'organization?:Relationship:Organization:CASCADE;place?:Relationship:TicketPlaceClassifier:PROTECT;category?:Relationship:TicketCategoryClassifier:PROTECT;problem?:Relationship:TicketProblemClassifier:PROTECT;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { TicketClassifierRule as TicketClassifierRuleGQL } from '@condo/domains/ticket/gql'
import { TicketClassifierRule, TicketClassifierRuleWhereInput, TicketClassifierRuleUpdateInput, QueryAllTicketClassifierRulesArgs } from '@app/condo/schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'organization', 'place', 'category', 'problem']
const RELATIONS = ['organization', 'place', 'category', 'problem']

export interface ITicketClassifierRuleUIState extends TicketClassifierRule {
    id: string
    // TODO(codegen): write ITicketClassifierRuleUIState or extends it from
}

function convertToUIState (item: TicketClassifierRule): ITicketClassifierRuleUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as ITicketClassifierRuleUIState
}

export interface ITicketClassifierRuleFormState {
    id?: undefined
    // TODO(codegen): write ITicketClassifierRuleUIFormState or extends it from
}

export type ITicketClassifierRuleWhereInput = Pick<TicketClassifierRuleWhereInput, 'organization' | 'organization_is_null' | 'id' | 'place' | 'category' | 'problem'>

function convertToUIFormState (state: ITicketClassifierRuleUIState): ITicketClassifierRuleFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as ITicketClassifierRuleFormState
}

function convertToGQLInput (state: ITicketClassifierRuleFormState): TicketClassifierRuleUpdateInput {
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
} = generateReactHooks<TicketClassifierRule, TicketClassifierRuleUpdateInput, ITicketClassifierRuleFormState, ITicketClassifierRuleUIState, QueryAllTicketClassifierRulesArgs>(TicketClassifierRuleGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}
