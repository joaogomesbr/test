/**
 * Generated by `createservice ticket.TicketAnalyticsReportService`
 */

const { GQLCustomSchema, getByCondition } = require('@core/keystone/schema')
const access = require('@condo/domains/ticket/access/TicketAnalyticsReportService')

const dayjs = require('dayjs')

const {
    sortStatusesByType,
    aggregateData,
    TicketGqlToKnexAdapter,
    getCombinations,
    enumerateDaysBetweenDates,
} = require('@condo/domains/ticket/utils/serverSchema/analytics.helper')
const { DATE_DISPLAY_FORMAT } = require('@condo/domains/ticket/constants/common')
const { TicketStatus: TicketStatusServerUtils, Ticket } = require('@condo/domains/ticket/utils/serverSchema')
const isEmpty = require('lodash/isEmpty')
const get = require('lodash/get')
const sum = require('lodash/sum')
const { createExportFile } = require('@condo/domains/common/utils/createExportFile')
const propertySummaryDataMapper = require('@condo/domains/ticket/utils/serverSchema/propertySummaryDataMapper')
const propertySingleDataMapper = require('@condo/domains/ticket/utils/serverSchema/propertySingleDataMapper')
const dayGroupDataMapper = require('@condo/domains/ticket/utils/serverSchema/dayGroupDataMapper')
const { GqlWithKnexLoadList } = require('@condo/domains/common/utils/serverSchema')
const propertyPercentDataMapper = require('@condo/domains/ticket/utils/serverSchema/propertyPercentDataMapper')
const propertySummaryPercentDataMapper = require('@condo/domains/ticket/utils/serverSchema/propertySummaryPercentDataMapper')

const PERCENT_AGGREGATION_TOKENS = ['property-status']

const createPropertyRange = async (organizationWhereInput, whereIn) => {
    const gqlLoaderOptions = {
        listKey: 'Property',
        fields: 'id address',
        where: { organization: organizationWhereInput, deletedAt: null },
    }
    const propertyFilter = get(whereIn, 'property', false)
    if (propertyFilter) {
        gqlLoaderOptions['where']['id_in'] = propertyFilter.flatMap(id => id)
    }
    const propertyLoader = new GqlWithKnexLoadList(gqlLoaderOptions)
    const properties = await propertyLoader.load()
    return properties.map( property => ({ label: property.address, value: property.id }))
}

const createStatusRange = async (context, organizationWhereInput, labelKey = 'name') => {
    const statuses = await TicketStatusServerUtils.getAll(context, { OR: [
        { organization: organizationWhereInput },
        { organization_is_null: true },
    ] })
    // We use organization specific statuses if they exists
    // or default if there is no organization specific status with a same type
    const allStatuses = statuses.filter(status => {
        if (!status.organization) {
            return true
        }
        return !statuses
            .find(organizationStatus => organizationStatus.organization !== null && organizationStatus.type === status.type)
    })
    return sortStatusesByType(allStatuses).map(status => ({ label: status[labelKey], value: status.id, color: status.colors.primary }))
}

const createCategoryClassifierRange = async (organizationWhereInput, whereIn) => {
    const gqlLoaderOptions = {
        listKey: 'TicketCategoryClassifier',
        fields: 'id name organization',
    }
    const categoryClassifierFilter = get(whereIn, 'categoryClassifier', false)
    if (categoryClassifierFilter) {
        gqlLoaderOptions['where'] = {
            id_in: categoryClassifierFilter.flatMap(id => id),
        }
    }
    const categoryClassifierLoader = new GqlWithKnexLoadList(gqlLoaderOptions)
    const classifiers = await categoryClassifierLoader.load()
    return classifiers.map(classifier => ({ label: classifier.name, value: classifier.id }))
}

// TODO(sitozzz): filter by executor role
const createExecutorRange = async (organizationWhereInput) => {
    const executorLoader = new GqlWithKnexLoadList({
        listKey: 'OrganizationEmployee',
        fields: 'id name',
        where: { organization: organizationWhereInput },
    })

    const executors = await executorLoader.load()
    return executors.map(executor => ({ label: executor.name, value: executor.id }))
}

// TODO(sitozzz): filter by assignee role
const createAssigneeRange = async (organizationWhereInput) => {
    const assigneeLoader = new GqlWithKnexLoadList({
        listKey: 'OrganizationEmployee',
        fields: 'id name',
        where: { organization: organizationWhereInput },
    })

    const assignees = await assigneeLoader.load()
    return assignees.map(assignee => ({ label: assignee.name, value: assignee.id }))
}

const getTicketCounts = async (context, where, groupBy, extraLabels = {}) => {
    const ticketGqlToKnexAdapter = new TicketGqlToKnexAdapter(where, groupBy)
    await ticketGqlToKnexAdapter.loadData()

    const translates = {}
    const options = {
        count: [0],
        property: [null],
        categoryClassifier: [null],
        executor: [null],
        assignee: [null],
        dayGroup: [dayjs().format('DD.MM.YYYY')],
    }

    for (const group of groupBy) {
        switch (group) {
            case 'property':
                translates[group] = await createPropertyRange(where.organization, ticketGqlToKnexAdapter.whereIn)
                options[group] = translates[group].map(({ label }) => label)
                break
            case 'status':
                translates[group] = await createStatusRange(
                    context, where.organization, isEmpty(extraLabels) ? 'name' :  extraLabels[group]
                )
                options[group] = translates[group].map(({ label }) => label)
                break
            case 'day':
            case 'week':
                options['dayGroup'] = enumerateDaysBetweenDates(ticketGqlToKnexAdapter.dateRange.from, ticketGqlToKnexAdapter.dateRange.to, group)
                break
            case 'categoryClassifier':
                translates[group] = await createCategoryClassifierRange(where.organization,  ticketGqlToKnexAdapter.whereIn)
                options[group] = translates[group].map(({ label }) => label)
                break
            case 'executor':
                translates[group] = await createExecutorRange(where.organization)
                options[group] = translates[group].map(({ label }) => label)
                break
            case 'assignee':
                translates[group] = await createAssigneeRange(where.organization)
                options[group] = translates[group].map(({ label }) => label)
                break
            default:
                break
        }
    }
    const ticketGqlResult = ticketGqlToKnexAdapter
        .getResult(({ count, dayGroup, ...searchResult }) =>
        {
            if (!isEmpty(translates)) {
                Object.entries(searchResult).forEach(([groupName, value]) => {
                    const translateMapping = get(translates, groupName, false)
                    if (translateMapping) {
                        const translation = translateMapping.find(translate => translate.value === value)
                        searchResult[groupName] = get(translation, 'label', null)
                    }
                })
                return {
                    ...searchResult,
                    dayGroup: dayjs(dayGroup).format(DATE_DISPLAY_FORMAT),
                    count: parseInt(count),
                }
            }
            return {
                ...searchResult,
                dayGroup: dayjs(dayGroup).format(DATE_DISPLAY_FORMAT),
                count: parseInt(count),
            }
        })
        // This is hack to process old database records with tickets with user organization and property from another org
        .filter(ticketCount => ticketCount.property !== null)
    const fullCombinationsResult = getCombinations({ options })

    const ticketMap = new Map()
    const transformedGroupBy = groupBy.map(group => ['day', 'week'].includes(group) ? 'dayGroup' : group)
    fullCombinationsResult.concat(ticketGqlResult).forEach(ticketCount => {
        const [mainGroup, childGroup] = transformedGroupBy
        const mapKey = (ticketCount[mainGroup] + ticketCount[childGroup]).toString()
        ticketMap.set(mapKey, ticketCount)
    })

    const ticketCounts = Array.from(ticketMap.values()).sort((a, b) =>
        dayjs(a.dayGroup, DATE_DISPLAY_FORMAT).unix() - dayjs(b.dayGroup, DATE_DISPLAY_FORMAT).unix())
    return { ticketCounts, translates }
}

const TicketAnalyticsReportService = new GQLCustomSchema('TicketAnalyticsReportService', {
    types: [
        {
            access: true,
            type: 'enum TicketAnalyticsGroupBy { day week month status property categoryClassifier executor assignee }',
        },
        {
            access: true,
            type: 'input TicketAnalyticsReportInput { where: TicketWhereInput!, groupBy: [TicketAnalyticsGroupBy!] }',
        },
        {
            access: true,
            type: 'type TicketLabel { label: String!, color: String!, value: String! }',
        },
        {
            access: true,
            type: 'type TicketAnalyticsReportOutput { groups: [TicketGroupedCounter!], ticketLabels: [TicketLabel] }',
        },
        {
            access: true,
            type: 'type TicketGroupedCounter { count: Int!, status: String, property: String, dayGroup: String!, categoryClassifier: String, executor: String, assignee: String  }',
        },
        {
            access: true,
            type: 'input ExportTicketAnalyticsToExcelTranslates { property: String }',
        },
        {
            access: true,
            type: 'input ExportTicketAnalyticsToExcelInput { where: TicketWhereInput!, groupBy: [TicketAnalyticsGroupBy!], translates: ExportTicketAnalyticsToExcelTranslates! }',
        },
        {
            access: true,
            type: 'type ExportTicketAnalyticsToExcelOutput { link: String! }',
        },
    ],
    queries: [
        {
            access: access.canReadTicketAnalyticsReport,
            schema: 'ticketAnalyticsReport(data: TicketAnalyticsReportInput): TicketAnalyticsReportOutput',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data: { where = {}, groupBy = [] } } = args
                const { ticketCounts: groups, translates } = await getTicketCounts(context, where, groupBy)
                const ticketLabels = get(translates, 'status', [])
                return { groups, ticketLabels }
            },
        },
        {
            access: access.canReadExportTicketAnalyticsToExcel,
            schema: 'exportTicketAnalyticsToExcel(data: ExportTicketAnalyticsToExcelInput): ExportTicketAnalyticsToExcelOutput',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data: { where = {}, groupBy = [], translates = {} } } = args
                const { ticketCounts } = await getTicketCounts(context, where, groupBy, { status: 'type' })
                const { result, groupKeys } = aggregateData(ticketCounts, groupBy)
                const ticketAccessCheck = await Ticket.getAll(context, where, { first: 1 })
                const [groupBy1, groupBy2] = groupKeys

                // TODO(sitozzz): find way to collect organization locale without additional request
                const organization = await getByCondition('Organization', {
                    id: where.organization.id,
                })

                let rowColumns = []
                const groupByToken = groupBy.join('-')
                const address = get(translates, 'property', '')
                switch (groupByToken) {
                    case 'status-day':
                    case 'status-week':
                        rowColumns = [...new Set(Object.values(result).flatMap(e => Object.keys(e)))]
                        break
                    case 'status-property':
                    case 'property-status':
                        rowColumns = address.includes('@') ? address.split('@') : []
                        break
                    default:
                        throw new Error('unsupported filter')
                }

                const tickets = []
                if (rowColumns.length === 0) {
                    const tableColumns = {}
                    if (PERCENT_AGGREGATION_TOKENS.includes(groupByToken)) {
                        const totalCount = Object.values(result)
                            .reduce((previousCount, currentAggregateObject) =>
                                previousCount + sum(Object.values(currentAggregateObject)), 0)

                        Object.entries(result).forEach(([ticketType, dataObject]) => {
                            const { rows } = propertySummaryPercentDataMapper(
                                { row: dataObject, constants: { address, totalCount } }
                            )
                            tableColumns[ticketType] = rows[ticketType]()
                            tableColumns.address = rows.address()
                        })
                    } else {
                        Object.entries(result).forEach(([ticketType, dataObject]) => {
                            const { rows } = propertySummaryDataMapper({ row: dataObject, constants: { address } })
                            tableColumns[ticketType] = rows[ticketType]()
                            tableColumns.address = rows.address()
                        })
                    }
                    tickets.push(tableColumns)
                } else {
                    switch (groupBy[1]) {
                        case 'status':
                        case 'property':
                            if (PERCENT_AGGREGATION_TOKENS.includes(groupByToken)) {
                                const totalCounts = {}
                                Object.values(result).forEach((dataObj) => {
                                    Object.entries(dataObj).forEach(([propertyAddress, count]) => {
                                        get(totalCounts, propertyAddress, false)
                                            ? (totalCounts[propertyAddress] += count)
                                            : (totalCounts[propertyAddress] = count)
                                    })
                                })
                                rowColumns.forEach(rowAddress => {
                                    const tableRow = {}
                                    Object.entries(result).forEach(rowEntry => {
                                        const [ticketType, dataObj] = rowEntry
                                        const { rows } = propertyPercentDataMapper({
                                            row: dataObj, constants: { address: rowAddress, totalCounts },
                                        })
                                        tableRow[ticketType] = rows[ticketType]()
                                        tableRow.address = rows.address()
                                    })
                                    tickets.push(tableRow)
                                })
                            } else {
                                rowColumns.forEach((rowAddress) => {
                                    const tableRow = {}
                                    Object.entries(result).forEach(([ticketType, dataObject]) => {
                                        const { rows } = propertySingleDataMapper(
                                            { row: dataObject, constants: { address: rowAddress } }
                                        )
                                        tableRow[ticketType] = rows[ticketType]()
                                        tableRow.address = rows.address()
                                    })
                                    tickets.push(tableRow)
                                })
                            }
                            break
                        case 'day':
                        case 'week':
                            rowColumns.forEach((date) => {
                                const tableColumns = {}
                                let addressRow = ''
                                let dateRow = ''
                                Object.keys(result).forEach(ticketType => {
                                    const { rows } = dayGroupDataMapper({ row: result, constants: { date, address } })
                                    tableColumns[ticketType] = rows[ticketType]()
                                    addressRow = rows.address()
                                    dateRow = rows.date()
                                })
                                tickets.push({ address: addressRow, date: dateRow, ...tableColumns })
                            })
                            break
                        default:
                            throw new Error('unsupported filter')
                    }
                }

                const link = await createExportFile({
                    fileName: `ticket_analytics_${dayjs().format('DD_MM')}.xlsx`,
                    templatePath: `./domains/ticket/templates/${organization.country}/TicketAnalyticsExportTemplate[${groupBy1}_${groupBy2}].xlsx`,
                    replaces: { tickets },
                    meta: {
                        listkey: 'Ticket',
                        id: ticketAccessCheck[0].id,
                    },
                })
                return { link }
            },
        },
    ],
})

module.exports = {
    TicketAnalyticsReportService,
}
