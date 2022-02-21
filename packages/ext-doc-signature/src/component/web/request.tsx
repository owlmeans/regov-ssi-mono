import {
  EmptyProps, generalIdVlidation, generalNameVlidation, humanReadableVersion, RegovComponentProps, urlVlidation, useNavigator, 
  useRegov, withRegov
} from '@owlmeans/regov-lib-react'
import {
  AlertOutput, FileProcessorWeb, FormMainAction, ListNavigator, LongTextInput, MainTextInput, 
  partialListNavigator, PrimaryForm, WalletFormProvider, FileProcessorParamsHandler
} from '@owlmeans/regov-mold-wallet-web'
import { REGISTRY_SECTION_OWN, REGISTRY_TYPE_REQUESTS } from '@owlmeans/regov-ssi-core'
import { Extension } from '@owlmeans/regov-ssi-extension'
import React, { Fragment, FunctionComponent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  ERROR_WIDGET_AUTHENTICATION, ERROR_WIDGET_EXTENSION, SignatureRequestSubject, REGOV_SIGNATURE_REQUEST_TYPE
} from '../../types'


export const SignatureRequestWeb = (ext: Extension): FunctionComponent<SignatureRequestParams> =>
  withRegov<SignatureRequestProps>({ namespace: ext.localization?.ns }, (props) => {
    const { t } = props
    const { handler } = useRegov()
    const navigate = useNavigate()
    const navigator = useNavigator<ListNavigator>(partialListNavigator(navigate))

    const [isCode, setIsCode] = useState<boolean>(false)

    const handle: FileProcessorParamsHandler = {}

    const methods = useForm<SignatureReuqestFields>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        signature: {
          request: {
            description: '',
            documentHash: '',
            url: '',
            authorId: '',
            version: '',
            name: '',
            file: '',
            alert: '',
          }
        }
      }
    })

    const _props = {
      ...props,
      rules: {
        'signature.request.name': generalNameVlidation(true),
        'signature.request.authorId': generalIdVlidation(false),
        'signature.request.url': urlVlidation(),
        'signature.request.version': humanReadableVersion
      }
    }

    const processFile = async () => {
      const loader = await navigator?.invokeLoading()
      const content = methods.getValues('signature.request.file')
      if (handler && handler.wallet) {
        methods.setValue(
          'signature.request.documentHash',
          handler.wallet.ssi.crypto.hash(content)
        )
      }
      try {
        const obj = JSON.parse(content)
        if (obj) {
          setIsCode(true)
        }
      } catch (error) {
        loader?.error(error.message)
        console.error(error)
      } finally {
        handle.setShowInput && handle.setShowInput(false)
        loader?.finish()
      }
    }

    const onDrop = async (files: File[]) => {
      const loader = await navigator?.invokeLoading()
      if (files.length) {
        const reader = new FileReader()

        reader.onabort = () => {
          methods.setError('signature.request.file', { type: 'file.aborted' })
        }

        reader.onerror = () => {
          methods.setError('signature.request.file', { type: 'file.error' })
        }

        reader.onload = () => {
          const data = reader.result as ArrayBuffer

          const decoder = new TextDecoder("utf-8")
          try {
            const text = decoder.decode(data)

            try {
              const obj = JSON.parse(text)
              if (obj) {
                setIsCode(true)
                return
              }
            } catch (e) { }
          } catch (error) {
            loader?.error(error.message)
            console.error(error)
          } finally {
            handle.setShowInput && handle.setShowInput(false)
            if (handler && handler.wallet) {
              methods.setValue(
                'signature.request.documentHash',
                handler.wallet.ssi.crypto.hash(Buffer.from(data))
              )
            }
            loader?.finish()
          }
        }

        reader.readAsArrayBuffer(files[0])
      }
    }

    const request = async (data: SignatureReuqestFields) => {
      const loader = await navigator?.invokeLoading()
      try {
        if (!handler.wallet) {
          throw ERROR_WIDGET_AUTHENTICATION
        }
        if (!ext) {
          throw ERROR_WIDGET_EXTENSION
        }
        const factory = ext.getFactory(REGOV_SIGNATURE_REQUEST_TYPE)
        const unsignedRequest = await factory.buildingFactory(handler.wallet, {
          subjectData: Object.fromEntries(
            Object.entries(data.signature.request)
              .filter(([key]) => !['alert', 'name', 'file'].includes(key))
          )
        })

        const request = await factory.requestFactory(handler.wallet, { unsignedRequest })

        const registry = handler.wallet.getRegistry(REGISTRY_TYPE_REQUESTS)
        const item = await registry.addCredential(request)

        item.meta.title = t('signature.request.meta.title', {
          name: data.signature.request.name,
        })

        loader?.success(t('signature.request.success'))

        handler.notify()

        if (item.credential.id) {
          await navigator.item(REGISTRY_TYPE_REQUESTS, {
            section: REGISTRY_SECTION_OWN,
            id: item.credential.id
          })
        }
      } catch (error) {
        console.error(error)
        loader?.error(error.message)
        if (error.message) {
          methods.setError('signature.request.alert', { type: error.message })
          return
        }
      } finally {
        loader?.finish()
      }
    }

    return <Fragment>
      <WalletFormProvider {...methods}>
        <PrimaryForm {..._props} title="signature.request.title">
          <FileProcessorWeb {..._props} field="signature.request.file"
            isCode={isCode} onDrop={onDrop} process={processFile} handler={handle} />
          <MainTextInput {..._props} field="signature.request.name" />
          <MainTextInput {..._props} field="signature.request.documentHash" />
          <LongTextInput {..._props} field="signature.request.description" />
          <MainTextInput {..._props} field="signature.request.url" />
          <MainTextInput {..._props} field="signature.request.version" />
          <MainTextInput {..._props} field="signature.request.authorId" />

          <AlertOutput {..._props} field="signature.request.alert" />

          <FormMainAction {..._props} title="signature.request.create" action={methods.handleSubmit(request)} />
        </PrimaryForm>
      </WalletFormProvider>
    </Fragment>
  })

export type SignatureRequestParams = EmptyProps

export type SignatureRequestProps = RegovComponentProps<SignatureRequestParams>

export type SignatureReuqestFields = {
  signature: {
    request: SignatureRequestSubject & {
      file: string
      name: string
      alert: string
    }
  }
}