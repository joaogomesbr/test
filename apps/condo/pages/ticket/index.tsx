/** @jsx jsx */
import { jsx } from '@emotion/core'
import { PageContent, PageHeader, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { Ticket } from '@condo/domains/ticket/utils/clientSchema'
import { CloseOutlined, DatabaseFilled, FilterFilled } from '@ant-design/icons'
import { IFilters } from '@condo/domains/ticket/utils/helpers'
import { useIntl } from '@core/next/intl'
import { Col, Input, Row, Typography, Checkbox, Form } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { get } from 'lodash'
import qs from 'qs'
import React, { useCallback, useState } from 'react'
import { EmptyListView } from '@condo/domains/common/components/EmptyListView'
import { useTableColumns } from '@condo/domains/ticket/hooks/useTableColumns'
import { useEmergencySearch } from '@condo/domains/ticket/hooks/useEmergencySearch'
import { useSearch } from '@condo/domains/common/hooks/useSearch'
import { Button } from '@condo/domains/common/components/Button'
import { useOrganization } from '@core/next/organization'
import { SortMeterReadingsBy, SortTicketsBy } from '@app/condo/schema'
import { TitleHeaderAction } from '@condo/domains/common/components/HeaderActions'
import { fontSizes } from '@condo/domains/common/constants/style'
import { useTicketTableFilters } from '@condo/domains/ticket/hooks/useTicketTableFilters'
import { useQueryMappers } from '@condo/domains/common/hooks/useQueryMappers'
import { getPageIndexFromOffset, parseQuery } from '@condo/domains/common/utils/tables.utils'
import { DEFAULT_PAGE_SIZE, Table } from '@condo/domains/common/components/Table/Index'
import { useMultipleFiltersModal } from '@condo/domains/common/hooks/useMultipleFiltersModal'
import { EXPORT_TICKETS_TO_EXCEL } from '@condo/domains/ticket/gql'
import { FocusContainer } from '@condo/domains/common/components/FocusContainer'
import { usePaidSearch } from '@condo/domains/ticket/hooks/usePaidSearch'
import { ExportToExcelActionBar } from '@condo/domains/common/components/ExportToExcelActionBar'

interface ITicketIndexPage extends React.FC {
    headerAction?: JSX.Element
    requiredAccess?: React.FC
}

export const TicketsPageContent = ({
    tableColumns,
    searchTicketsQuery,
    sortBy,
    filterMetas,
}) => {
    const intl = useIntl()
    const PageTitleMessage = intl.formatMessage({ id: 'pages.condo.ticket.index.PageTitle' })
    const SearchPlaceholder = intl.formatMessage({ id: 'filters.FullSearch' })
    const EmptyListLabel = intl.formatMessage({ id: 'ticket.EmptyList.header' })
    const EmptyListMessage = intl.formatMessage({ id: 'ticket.EmptyList.title' })
    const CreateTicket = intl.formatMessage({ id: 'CreateTicket' })
    const FiltersButtonLabel = intl.formatMessage({ id: 'FiltersLabel' })

    const router = useRouter()
    const { filters, offset } = parseQuery(router.query)
    const currentPageIndex = getPageIndexFromOffset(offset, DEFAULT_PAGE_SIZE)

    let appliedFiltersCount = 0
    for (const filter in filters) {
        if (Array.isArray(filters[filter]) && filters[filter].length > 0) {
            appliedFiltersCount++
        }
    }

    const { MultipleFiltersModal, setIsMultipleFiltersModalVisible } = useMultipleFiltersModal(filterMetas)

    searchTicketsQuery = { ...searchTicketsQuery, ...{ deletedAt: null } }

    const {
        loading,
        count: total,
        objs: tickets,
    } = Ticket.useObjects({
        sortBy: sortBy as SortTicketsBy[],
        where: searchTicketsQuery,
        first: DEFAULT_PAGE_SIZE,
        skip: (currentPageIndex - 1) * DEFAULT_PAGE_SIZE,
    }, {
        fetchPolicy: 'network-only',
    })

    const handleRowAction = useCallback((record) => {
        return {
            onClick: () => {
                router.push(`/ticket/${record.id}/`)
            },
        }
    }, [])

    const [search, handleSearchChange] = useSearch<IFilters>(loading)
    const [emergency, handleEmergencyChange] = useEmergencySearch<IFilters>(loading)
    const [paid, handlePaidChange] = usePaidSearch<IFilters>(loading)

    const resetQuery = async () => {
        if ('offset' in router.query) router.query['offset'] = '0'
        const query = qs.stringify(
            { ...router.query, filters: JSON.stringify({}) },
            { arrayFormat: 'comma', skipNulls: true, addQueryPrefix: true },
        )

        await router.push(router.route + query)
    }

    return (
        <>
            <Head>
                <title>{PageTitleMessage}</title>
            </Head>
            <PageWrapper>
                <PageHeader title={<Typography.Title style={{ margin: 0 }}>{PageTitleMessage}</Typography.Title>}/>
                <PageContent>
                    {
                        !tickets.length && !filters
                            ? <EmptyListView
                                label={EmptyListLabel}
                                message={EmptyListMessage}
                                createRoute='/ticket/create'
                                createLabel={CreateTicket} />
                            : (
                                <Row gutter={[0, 40]} align={'middle'} justify={'center'}>
                                    <Col span={23}>
                                        <FocusContainer padding={'16px'}>
                                            <Row justify={'space-between'}>
                                                <Col span={15}>
                                                    <Row gutter={[40, 0]} align={'middle'}>
                                                        <Col span={11}>
                                                            <Input
                                                                placeholder={SearchPlaceholder}
                                                                onChange={(e)=>{handleSearchChange(e.target.value)}}
                                                                value={search}
                                                            />
                                                        </Col>
                                                        <Col span={5}>
                                                            <Checkbox
                                                                onChange={handleEmergencyChange}
                                                                checked={emergency}
                                                                style={{ paddingLeft: '0px', fontSize: fontSizes.content }}
                                                            >
                                                                {'Аварийные'}
                                                            </Checkbox>
                                                        </Col>
                                                        <Col span={5}>
                                                            <Checkbox
                                                                onChange={handlePaidChange}
                                                                checked={paid}
                                                                style={{ paddingLeft: '0px', fontSize: fontSizes.content }}
                                                            >
                                                                {'Платные'}
                                                            </Checkbox>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col>
                                                    <Row>
                                                        {
                                                            appliedFiltersCount > 0 ? (
                                                                <Col>
                                                                    <Button
                                                                        type={'text'}
                                                                        onClick={resetQuery}
                                                                    >
                                                                        <Typography.Text strong type={'secondary'}>
                                                                            {'Сбросить'} <CloseOutlined style={{ fontSize: '12px' }} />
                                                                        </Typography.Text>
                                                                    </Button>,
                                                                </Col>
                                                            ) : null
                                                        }
                                                        <Col>
                                                            <Button
                                                                secondary
                                                                type={'sberPrimary'}
                                                                onClick={() => setIsMultipleFiltersModalVisible(true)}
                                                            >
                                                                <FilterFilled/>
                                                                {FiltersButtonLabel}
                                                                {appliedFiltersCount > 0 ? `(${appliedFiltersCount})` : null}
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </FocusContainer>
                                    </Col>
                                    <Col span={24}>
                                        <Table
                                            totalRows={total}
                                            loading={loading}
                                            dataSource={tickets}
                                            columns={tableColumns}
                                            onRow={handleRowAction}
                                        />
                                    </Col>
                                    <ExportToExcelActionBar
                                        searchObjectsQuery={searchTicketsQuery}
                                        sortBy={sortBy}
                                        exportToExcelQuery={EXPORT_TICKETS_TO_EXCEL}
                                    />
                                </Row>
                            )
                    }
                    <MultipleFiltersModal />
                </PageContent>
            </PageWrapper>
        </>
    )
}

const TicketsPage: ITicketIndexPage = () => {
    const userOrganization = useOrganization()
    const userOrganizationId = get(userOrganization, ['organization', 'id'])

    const filterMetas = useTicketTableFilters()

    const sortableProperties = ['number', 'status', 'details', 'property', 'assignee', 'executor', 'createdAt', 'clientName']

    const { filtersToWhere, sortersToSortBy } = useQueryMappers(filterMetas, sortableProperties)

    const router = useRouter()
    const { filters, sorters } = parseQuery(router.query)

    const tableColumns = useTableColumns(filterMetas)

    const searchTicketsQuery = { ...filtersToWhere(filters), organization: { id: userOrganizationId } }

    return (
        <TicketsPageContent
            tableColumns={tableColumns}
            searchTicketsQuery={searchTicketsQuery}
            sortBy={sortersToSortBy(sorters) as SortMeterReadingsBy[]}
            filterMetas={filterMetas}
        />
    )
}

TicketsPage.headerAction = <TitleHeaderAction descriptor={{ id: 'menu.ControlRoom' }}/>
TicketsPage.requiredAccess = OrganizationRequired

export default TicketsPage
