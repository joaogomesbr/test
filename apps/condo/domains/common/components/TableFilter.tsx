import { Input, Space } from 'antd'
import React, { CSSProperties } from 'react'
import { useIntl } from '@core/next/intl'
import { Button } from './Button'
import { FilterFilled } from '@ant-design/icons'
import { colors } from '../constants/style'
import { FilterDropdownProps } from 'antd/lib/table/interface'

export interface IFilterContainerProps {
    clearFilters: () => void
    showClearButton?: boolean
    style?: CSSProperties
}

const FilterContainerContent: React.FC<IFilterContainerProps> = (props) => {
    const intl = useIntl()
    const ResetLabel = intl.formatMessage({ id: 'filters.Reset' })

    return (
        <>
            {props.children}
            {
                props.showClearButton && (
                    <Button
                        size={'small'}
                        onClick={() => props.clearFilters()}
                        type={'inlineLink'}
                    >
                        {ResetLabel}
                    </Button>
                )
            }
        </>
    )
}

export const FilterContainer: React.FC<IFilterContainerProps> = (props) => {
    return (
        <div style={{ padding: 16 }}>
            <Space size={8} direction={'vertical'} align={'center'}>
                <FilterContainerContent {...props}/>
            </Space>
        </div>
    )
}

export const SelectFilterContainer: React.FC<IFilterContainerProps> = (props) => {
    return (
        <div style={{
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '10px',
            ...props.style }}>
            <FilterContainerContent {...props}/>
        </div>
    )
}

export const getFilterIcon = filtered => <FilterFilled style={{ color: filtered ? colors.sberPrimary[5] : undefined }} />

export const getTextFilterDropdown = (columnName: string, setFiltersApplied: React.Dispatch<React.SetStateAction<boolean>>) => {
    const TextFilterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
        <FilterContainer
            clearFilters={clearFilters}
            showClearButton={selectedKeys && selectedKeys.length > 0}>
            <Input
                placeholder={columnName}
                // @ts-ignore
                value={selectedKeys}
                onChange={(e) => {
                    // @ts-ignore
                    setSelectedKeys(e.target.value)
                    setFiltersApplied(true)
                    confirm({ closeDropdown: false })
                }}
            />
        </FilterContainer>
    )

    return TextFilterDropdown
}