// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { DiffOutlined } from '@ant-design/icons'
import { Alert, Modal, Progress } from 'antd'
import get from 'lodash/get'
import React, { useCallback, useRef, useState } from 'react'
import { useOrganization } from '@core/next/organization'
import { useAuth } from '@core/next/auth'
import { useApolloClient } from '@core/next/apollo'
import { Button } from '../../common/components/Button'
import { DataImporter } from '../../common/components/DataImporter'
import { searchProperty } from '../../ticket/utils/clientSchema/search'
import { Property } from '../utils/clientSchema'
import { PropertyImporter } from '../utils/PropertyImporter'

// TODO(Dimitreee): add interface
const useImporter = (onFinish, onError) => {
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState(null)
    const [isImported, setIsImported] = useState(false)
    const userOrganization = useOrganization()
    const userOrganizationId = get(userOrganization, ['organization', 'id'])
    const client = useApolloClient()
    const importer = useRef(null)

    const createProperty = Property.useCreate(
        {
            organization: userOrganizationId,
        },
        () => Promise.resolve()
    )

    const validateProperty = (address) => searchProperty(userOrganizationId)(client, address)
        .then((res) => {
            return res.length === 0
        })

    const importData = useCallback((data) => {
        importer.current = null
        // reset hook state
        setIsImported(false)
        setError(null)
        setProgress(0)

        importer.current = new PropertyImporter(createProperty, validateProperty)
        importer.current.onProgressUpdate(setProgress)
        importer.current.onError((e) => {
            importer.current = null
            setError(e)

            onError()
        })
        importer.current.onFinish(() => {
            importer.current = null
            setIsImported(true)

            onFinish()
        })
        importer.current.import(data)
    }, [])

    const breakImport = () => {
        if (importer) {
            importer.current.break()
        }
    }

    return [importData, progress, error, isImported, breakImport]
}

const ModalContext = React.createContext({ progress: 0, error: null, isImported: false })

const getPropertyUploadInfoModalConfig = (onButtonClick) => {
    return {
        // TODO(Dimitreee):add translations
        title: 'Импорт',
        closable: false,
        content: (
            <ModalContext.Consumer>
                {
                    ({ progress }) => {
                        return (
                            <>
                                <Progress
                                    format={(percent) => Math.floor(percent) + '%'}
                                    percent={progress}
                                    status={'active'}
                                />
                                <Alert
                                    style={{ marginTop: 16 }}
                                    // TODO(Dimitreee): add translations
                                    message='Данные обрабатываются, не закрывайте вкладку браузера и не выключайте компьютер.'
                                    type='info'
                                />
                            </>
                        )
                    }
                }
            </ModalContext.Consumer>
        ),
        okText: 'Прервать',
        onOk: onButtonClick,
        okButtonProps: {
            type: 'primary',
            danger: true,
        },
    }
}

const getPropertyUploadSuccessModalConfig = () => {
    return {
        // TODO(Dimitreee):add translations
        title: 'Импорт',
        closable: true,
        content: (
            <Alert
                style={{ marginTop: 16 }}
                // TODO(Dimitreee): add translations
                message='Дома добавлены.'
                type='success'
            />
        ),
        okText: 'Продолжить',
    }
}

const getPropertyUploadErrorModalConfig = () => {
    return {
        // TODO(Dimitreee):add translations
        title: 'Импорт',
        closable: true,
        content: (
            <ModalContext.Consumer>
                {
                    ({ error }) => {
                        const errorMessage = get(error, 'message') || 'Во время обработки документа произошла ошибка, проверьте корректность предоставленных данных или обратитесь в службу поддержки.'

                        return (
                            <Alert
                                style={{ marginTop: 16 }}
                                // TODO(Dimitreee): add translations
                                message={errorMessage}
                                type='error'
                            />
                        )
                    }
                }
            </ModalContext.Consumer>
        ),
        okText: 'Продолжить',
    }
}

interface IPropertyImport {
    onFinish(): boolean
}

export const PropertyImport: React.FC<IPropertyImport> = (props) => {
    const userOrganization = useOrganization()
    const auth = useAuth()
    const [modal, contextHolder] = Modal.useModal()
    const activeModal = useRef(null)

    const destroyActiveModal = () => {
        if (activeModal.current) {
            activeModal.current.destroy()
            activeModal.current = null
        }
    }

    const [importData, progress, error, isImported, breakImport] = useImporter(
        () => {
            destroyActiveModal()
            const config = getPropertyUploadSuccessModalConfig()
            activeModal.current = modal.success(config)

            props.onFinish()
        },
        () => {
            destroyActiveModal()
            const config = getPropertyUploadErrorModalConfig()
            activeModal.current = modal.error(config)
        },
    )

    const handleUpload = useCallback((file) => {
        destroyActiveModal()
        const config = getPropertyUploadInfoModalConfig(() => {
            breakImport()
            props.onFinish()}
        )
        activeModal.current = modal.info(config)

        importData(file.data)
    }, [])

    const organizationCreatorId = get(userOrganization, ['organization', 'createdBy', 'id'])
    const userID = get(auth, ['user', 'id'])
    const isOwner = organizationCreatorId === userID

    return (
        isOwner && (
            <ModalContext.Provider value={{ progress, error, isImported }}>
                <DataImporter onUpload={handleUpload}>
                    <Button
                        type={'sberPrimary'}
                        icon={<DiffOutlined />}
                        secondary
                    />
                </DataImporter>
                {contextHolder}
            </ModalContext.Provider>
        )
    )
}
