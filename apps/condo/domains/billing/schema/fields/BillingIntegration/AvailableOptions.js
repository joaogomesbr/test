const Ajv = require('ajv')
const {
    BILLING_INTEGRATION_OPTIONS_FIELD_NAME,
    BILLING_INTEGRATION_OPTIONS_INPUT_NAME,
    BILLING_INTEGRATION_OPTION_FIELD_NAME,
    BILLING_INTEGRATION_OPTION_INPUT_NAME,
    BILLING_INTEGRATION_OPTION_DETAILS_FIELD_NAME,
    BILLING_INTEGRATION_OPTION_DETAILS_INPUT_NAME,
    BILLING_INTEGRATION_DATA_FORMAT_FIELD_NAME,
    BILLING_INTEGRATION_DATA_FORMAT_INPUT_NAME,
} = require('@condo/domains/billing/constants/constants')
const { render, getValidator } = require('@condo/domains/billing/schema/fields/utils/json.utils')
const { Json } = require('@core/keystone/fields')
const {
    DATA_FORMAT_SCHEMA,
    DATA_FORMAT_GQL_TYPES,
    DATA_FORMAT_QUERY_LIST,
} = require('./DataFormat')

const AvailableOptionDetailsFields = {
    urlText: 'String!',
    url: 'String!',
}

const AvailableOptionFields = {
    name: 'String!',
    displayName: 'String',
    billingPageTitle: 'String',
    descriptionDetails: BILLING_INTEGRATION_OPTION_DETAILS_FIELD_NAME,
    dataFormat: BILLING_INTEGRATION_DATA_FORMAT_FIELD_NAME,
}

const AvailableOptionInputs = {
    ...AvailableOptionFields,
    descriptionDetails: BILLING_INTEGRATION_OPTION_DETAILS_INPUT_NAME,
    dataFormat: BILLING_INTEGRATION_DATA_FORMAT_INPUT_NAME,
}

const AvailableOptionsFields = {
    title: 'String!',
    options: `[${BILLING_INTEGRATION_OPTION_FIELD_NAME}!]!`,
}

const AvailableOptionsInputs = {
    title: 'String!',
    options: `[${BILLING_INTEGRATION_OPTION_INPUT_NAME}!]!`,
}

const AVAILABLE_OPTIONS_GRAPHQL_TYPES = `
    type ${BILLING_INTEGRATION_OPTION_DETAILS_FIELD_NAME} {
        ${render(AvailableOptionDetailsFields)}    
    }
    
    input ${BILLING_INTEGRATION_OPTION_DETAILS_INPUT_NAME} {
        ${render(AvailableOptionDetailsFields)}
    }
    
    type ${BILLING_INTEGRATION_OPTION_FIELD_NAME} {
        ${render(AvailableOptionFields)}
    }
    
    input ${BILLING_INTEGRATION_OPTION_INPUT_NAME} {
        ${render(AvailableOptionInputs)}
    }
    
    type ${BILLING_INTEGRATION_OPTIONS_FIELD_NAME} {
        ${render(AvailableOptionsFields)}
    }
    
    input ${BILLING_INTEGRATION_OPTIONS_INPUT_NAME} {
        ${render(AvailableOptionsInputs)}
    }
`

const AvailableOptionSchema = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        billingPageTitle: { type: ['string', 'null'] },
        displayName: { type: ['string', 'null'] },
        descriptionDetails: {
            type: ['object', 'null'],
            properties: {
                urlText: { type: 'string' },
                url: { type: 'string' },
            },
            required: ['urlText', 'url'],
            additionalProperties: false,
        },
        dataFormat: {
            ...DATA_FORMAT_SCHEMA,
            type: ['object', 'null'],
        },
    },
    required: ['name'],
    additionalProperties: false,
}

const AvailableOptionsSchema = {
    type: 'object',
    properties: {
        title: { type: 'string' },
        options: {
            type: 'array',
            items: AvailableOptionSchema,
        },
    },
    required: ['title', 'options'],
    additionalProperties: false,
}

const ajv = new Ajv()
const AvailableOptionsSchemaValidator = ajv.compile(AvailableOptionsSchema)
const validateAvailableOptions = getValidator(AvailableOptionsSchemaValidator)
const AVAILABLE_OPTIONS_QUERY_LIST = `title options { name displayName billingPageTitle descriptionDetails { urlText url } dataFormat { ${DATA_FORMAT_QUERY_LIST} } }`

const AVAILABLE_OPTIONS_FIELD = {
    schemaDoc: 'List of available billing options. If it exists, it means that several options are available for connecting billing',
    type: Json,
    isRequired: false,
    extendGraphQLTypes: [DATA_FORMAT_GQL_TYPES, AVAILABLE_OPTIONS_GRAPHQL_TYPES],
    graphQLInputType: BILLING_INTEGRATION_OPTIONS_INPUT_NAME,
    graphQLReturnType: BILLING_INTEGRATION_OPTIONS_FIELD_NAME,
    graphQLAdminFragment: `{ ${AVAILABLE_OPTIONS_QUERY_LIST} }`,
    hooks: {
        validateInput: validateAvailableOptions,
    },
}

module.exports = {
    AVAILABLE_OPTIONS_FIELD,
    AvailableOptionFields,
    AvailableOptionInputs,
    AvailableOptionSchema,
}

