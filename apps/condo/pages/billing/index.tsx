import React from 'react'
import Head from 'next/head'
import { TitleHeaderAction } from '@condo/domains/common/components/HeaderActions'
import { useIntl } from '@core/next/intl'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { PageHeader, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { Typography } from 'antd'
import { BillingPageContent } from '@condo/domains/billing/components/BillingPageContent'
import { useOrganization } from '@core/next/organization'
import get from 'lodash/get'
import { BillingIntegrationOrganizationContext } from '@condo/domains/billing/utils/clientSchema'
import { TablePageContent } from '@condo/domains/common/components/containers/BaseLayout/BaseLayout'

const BillingPage = () => {
    const intl = useIntl()
    const BillingTitle = intl.formatMessage({ id:'menu.Billing' })

    const userOrganization = useOrganization()
    const organizationId = get(userOrganization, ['organization', 'id'], '')
    const canReadBillingReceipts = get(userOrganization, ['link', 'role', 'canReadBillingReceipts'], false)
    const {
        obj: currentContext,
        error: contextError,
        loading: contextLoading,
    } = BillingIntegrationOrganizationContext.useObject({
        where: {
            organization: {
                id: organizationId,
            },
        },
    }, {
        fetchPolicy: 'network-only',
    })

    const options = get(currentContext, ['integration', 'availableOptions', 'options'], [])
    const namedOptions = options.filter(option => option.name === get(currentContext, 'integrationOption'))
    const integrationPageTitle = get(currentContext, ['integration', 'billingPageTitle'], BillingTitle)
    const PageTitle = get(namedOptions, ['0', 'billingPageTitle'], integrationPageTitle)

    return (
        <>
            <Head>
                <title>
                    {BillingTitle}
                </title>
            </Head>
            <PageWrapper>
                <PageHeader title={<Typography.Title style={{ margin: 0 }}>{PageTitle}</Typography.Title>}/>
                <TablePageContent>
                    <BillingPageContent
                        access={canReadBillingReceipts}
                        contextLoading={contextLoading}
                        contextError={contextError}
                        context={currentContext}
                    />
                </TablePageContent>
            </PageWrapper>
        </>
    )
}

BillingPage.headerAction = <TitleHeaderAction descriptor={{ id:'menu.Billing' }}/>
BillingPage.requiredAccess = OrganizationRequired

export default BillingPage