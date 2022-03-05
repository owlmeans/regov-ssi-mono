import {
  EmptyProps, generalNameVlidation, RegovComponentProps, urlVlidation, useRegov, withRegov,
  humanReadableVersion, useNavigator, generalIdVlidation
} from '@owlmeans/regov-lib-react'
import {
  AlertOutput, dateFormatter, FileProcessorWeb, FormMainAction, LongTextInput, MainTextInput,
  MainTextOutput, PrimaryForm, WalletFormProvider, partialListNavigator, ListNavigator, CredentialSelector
} from '@owlmeans/regov-mold-wallet-web'
import { CredentialsRegistryWrapper, REGISTRY_SECTION_OWN, REGISTRY_TYPE_CREDENTIALS, REGISTRY_TYPE_IDENTITIES } from '@owlmeans/regov-ssi-core'
import { Extension } from '@owlmeans/regov-ssi-extension'
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  DOCUMENT_TYPE_JSON, DOCUMENT_TYPE_TEXT, DOCUMENT_TYPE_BINARY, REGOV_CREDENTIAL_TYPE_SIGNATURE,
  ERROR_WIDGET_AUTHENTICATION, SignatureSubject
} from '../../types'
import { typeFormatterFacotry } from '../formatter'
const isUtf8 = require('is-utf8') as (arg: any) => boolean


export const SignatureCreationWeb = (ext: Extension): FunctionComponent<SignatureCreationParams> =>
  withRegov<SignatureCreationProps>({ namespace: ext.localization?.ns }, (props) => {
    const { next, t } = props
    const { handler } = useRegov()
    const navigate = useNavigate()
    const navigator = useNavigator<ListNavigator>(partialListNavigator(navigate))

    const methods = useForm<SignatureCreationFields>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        signature: {
          creation: {
            name: '',
            description: '',
            url: '',
            version: '',
            author: '',
            authorId: '',
            file: '',
            filename: '',
            creationDate: '',
            documentHash: '',
            docType: '',
            alert: '',
            identity: ''
          }
        }
      }
    })

    const [fileContent, setFileContent] = useState<ArrayBuffer | undefined>(undefined)
    const [isCode, setIsCode] = useState<boolean>(false)
    const [defaultId, setDefaultId] = useState<string | undefined>(undefined)

    const registry = handler.wallet?.getRegistry(REGISTRY_TYPE_IDENTITIES) as CredentialsRegistryWrapper
    const identities = registry?.registry.credentials[REGISTRY_SECTION_OWN] || []
    useEffect(() => {
      const id = handler.wallet?.getIdentity()?.credential.id
      if (id) {
        setDefaultId(id)
      } else {
        methods.setError('signature.creation.alert', { type: 'noIdentity' })
      }
    }, [registry?.registry.credentials[REGISTRY_SECTION_OWN].length])

    const create = async (data: SignatureCreationFields) => {
      const loader = await navigator?.invokeLoading()
      try {
        if (!handler.wallet) {
          throw ERROR_WIDGET_AUTHENTICATION
        }

        const subject = Object.fromEntries(
          Object.entries(data.signature.creation).filter(([key]) => ![
            'alert', 'file', 'identity'
          ].includes(key))
        )

        const identity = registry.getCredential(data.signature.creation.identity)?.credential

        const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_SIGNATURE)
        const unsigned = await factory.build(handler.wallet, {
          identity, subjectData: {
            ...subject,
            signedAt: new Date().toISOString()
          }
        })
        const credential = await factory.sign(handler.wallet, {
          unsigned,
          evidence: identity
        })

        const credRegistry = handler.wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS)
        const item = await credRegistry.addCredential(credential)
        item.meta.title = data.signature.creation.name

        loader?.success(t('signature.creation.success'))

        handler.notify()

        if (item.credential.id) {
          await navigator.item(REGISTRY_TYPE_CREDENTIALS, {
            section: REGISTRY_SECTION_OWN,
            id: item.credential.id
          })
        } else {
          next()
        }
      } catch (error) {
        loader?.error(error.message)
        methods.setError('signature.creation.alert', { type: error.message })
      } finally {
        loader?.finish()
      }
    }

    const processFile = async () => {
      const loader = await navigator?.invokeLoading()
      try {
        const content = methods.getValues('signature.creation.file')
        const encoder = new TextEncoder()
        methods.setValue('signature.creation.creationDate', new Date().toISOString())
        setFileContent(encoder.encode(content))
        if (handler && handler.wallet) {
          methods.setValue('signature.creation.documentHash', handler.wallet.ssi.crypto.hash(content))
        }

        const obj = JSON.parse(content)
        if (obj) {
          setIsCode(true)
          methods.setValue('signature.creation.docType', DOCUMENT_TYPE_JSON)
        }
      } catch (error) {
        loader?.error(error.message)
        methods.setValue('signature.creation.docType', DOCUMENT_TYPE_TEXT)
        console.error(error)
      } finally {
        loader?.finish()
      }
    }

    const onDrop = async (files: File[]) => {
      const loader = await navigator?.invokeLoading()
      if (files.length) {
        const reader = new FileReader()

        reader.onabort = () => {
          methods.setError('signature.creation.file', { type: 'file.aborted' })
          loader?.finish()
        }

        reader.onerror = () => {
          methods.setError('signature.creation.file', { type: 'file.error' })
          loader?.finish()
        }

        reader.onload = () => {
          const data = reader.result as ArrayBuffer
          try {
            setFileContent(data)
            const decoder = new TextDecoder("utf-8")
            const text = decoder.decode(data)

            try {
              const obj = JSON.parse(text)
              if (obj) {
                setIsCode(true)
                methods.setValue('signature.creation.docType', DOCUMENT_TYPE_JSON)
                return
              }
            } catch (e) { }
            if (isUtf8(Buffer.from(data))) {
              methods.setValue('signature.creation.docType', DOCUMENT_TYPE_TEXT)
            } else {
              methods.setValue('signature.creation.docType', DOCUMENT_TYPE_BINARY)
            }
          } catch (error) {
            loader?.error(error.message)
            console.error(error)
          } finally {
            methods.setValue('signature.creation.creationDate', new Date(files[0].lastModified).toISOString())
            methods.setValue('signature.creation.filename', files[0].name)
            if (handler && handler.wallet) {
              methods.setValue(
                'signature.creation.documentHash',
                handler.wallet.ssi.crypto.hash(Buffer.from(data))
              )
            }
            loader?.finish()
          }
        }

        reader.readAsArrayBuffer(files[0])
      }
    }

    const _props = {
      ...props,
      rules: {
        'signature.creation.name': generalNameVlidation(true),
        'signature.creation.author': generalNameVlidation(false),
        'signature.creation.authorId': generalIdVlidation(false),
        'signature.creation.url': urlVlidation(),
        'signature.creation.version': humanReadableVersion
      }
    }

    const filename = methods.watch('signature.creation.filename')

    return <Fragment>
      <WalletFormProvider {...methods}>
        {!fileContent
          ? <PrimaryForm {..._props} title="signature.creation.title">
            <FileProcessorWeb {..._props} field="signature.creation.file"
              isCode={isCode} onDrop={onDrop} process={processFile} />
          </PrimaryForm>
          : <PrimaryForm {..._props} title="signature.creation.title">
            <MainTextInput {..._props} field="signature.creation.name" />
            <LongTextInput {..._props} field="signature.creation.description" />
            <MainTextInput {..._props} field="signature.creation.url" />
            <MainTextInput {..._props} field="signature.creation.version" />
            <MainTextInput {..._props} field="signature.creation.author" />
            <MainTextInput {..._props} field="signature.creation.authorId" />
            <MainTextOutput {..._props} field="signature.creation.documentHash" showHint />
            <MainTextOutput {..._props} field="signature.creation.docType" showHint formatter={
              typeFormatterFacotry(t)
            } />
            {
              filename && filename !== ''
              && <MainTextOutput {..._props} field="signature.creation.filename" showHint />
            }
            <MainTextOutput {..._props} field="signature.creation.creationDate" showHint formatter={dateFormatter} />

            <AlertOutput {..._props} field="signature.creation.alert" />

            <CredentialSelector {...props} field="signature.creation.identity"
              credentials={identities} defaultId={defaultId} />

            <FormMainAction {..._props} title="signature.creation.create" action={methods.handleSubmit(create)} />
          </PrimaryForm>
        }
      </WalletFormProvider>
    </Fragment>
  })

export type SignatureCreationParams = EmptyProps & { next: () => void }

export type SignatureCreationProps = RegovComponentProps<SignatureCreationParams>

export type SignatureCreationFields = {
  signature: {
    creation: SignatureSubject & {
      file: string
      alert: string
      identity: string
    }
  }
}
