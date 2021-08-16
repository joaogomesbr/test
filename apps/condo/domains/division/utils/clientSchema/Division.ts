/**
 * Generated by `createschema division.Division 'name:Text; organization:Relationship:Organization:CASCADE; responsible:Relationship:OrganizationEmployee:PROTECT;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { Division as DivisionGQL } from '@condo/domains/division/gql'
import { Division, DivisionUpdateInput, QueryAllDivisionsArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'name', 'organization', 'responsible']
const RELATIONS = ['organization', 'responsible']

export interface IDivisionUIState extends Division {
    id: string
    // TODO(codegen): write IDivisionUIState or extends it from
}

function convertToUIState (item: Division): IDivisionUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IDivisionUIState
}

export interface IDivisionFormState {
    id?: undefined
    // TODO(codegen): write IDivisionUIFormState or extends it from
}

function convertToUIFormState (state: IDivisionUIState): IDivisionFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IDivisionFormState
}

function convertToGQLInput (state: IDivisionFormState): DivisionUpdateInput {
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
} = generateReactHooks<Division, DivisionUpdateInput, IDivisionFormState, IDivisionUIState, QueryAllDivisionsArgs>(DivisionGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}