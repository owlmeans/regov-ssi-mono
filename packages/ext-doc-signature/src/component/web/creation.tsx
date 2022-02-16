import {
  EmptyProps, generalNameVlidation, RegovComponetProps, urlVlidation, useRegov, withRegov,
  humanReadableVersion
} from '@owlmeans/regov-lib-react'
import {
  AlertOutput, dateFormatter, FileProcessorWeb, FormMainAction, LongTextInput, MainTextInput,
  MainTextOutput, PrimaryForm, WalletFormProvider
} from '@owlmeans/regov-mold-wallet-web'
import { REGISTRY_TYPE_CREDENTIALS } from '@owlmeans/regov-ssi-core'
import { Extension } from '@owlmeans/regov-ssi-extension'
import React, { Fragment, FunctionComponent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DOCUMENT_TYPE_JSON, DOCUMENT_TYPE_TEXT, DOCUMENT_TYPE_BINARY, REGOV_CREDENTIAL_TYPE_SIGNATURE, ERROR_WIDGET_AUTHENTICATION } from '../../types'
import { typeFormatterFacotry } from '../formatter'
const isUtf8 = require('is-utf8') as (arg: any) => boolean


export const SignatureCreationWeb = (ext: Extension): FunctionComponent<SignatureCreationParams> =>
  withRegov<SignatureCreationProps>({ namespace: ext.localization?.ns }, (props) => {
    const { navigator, next, t } = props
    const { handler } = useRegov()

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
            docType: ''
          }
        }
      }
    })

    const [fileContent, setFileContent] = useState<ArrayBuffer | undefined>(undefined)
    const [isCode, setIsCode] = useState<boolean>(false)

    const create = async (data: SignatureCreationFields) => {
      const loader = await navigator?.invokeLoading()
      console.log(data)
      try {
        if (!handler.wallet) {
          throw ERROR_WIDGET_AUTHENTICATION
        }

        const subject = Object.fromEntries(
          Object.entries(data.signature.creation).filter(([key]) => !['alert', 'file'].includes(key))
        )

        const factory = ext.getFactory(REGOV_CREDENTIAL_TYPE_SIGNATURE)
        const unsigned = await factory.buildingFactory(
          handler.wallet, { subjectData: subject }
        )
        const credential = await factory.signingFactory(handler.wallet, {
          unsigned,
          evidence: handler.wallet.getIdentity()?.credential
        })

        const registry = handler.wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS)
        const item = await registry.addCredential(credential)
        item.meta.title = data.signature.creation.name

        loader?.success(t('signature.creation.success'))

        handler.notify()

        next()
      } catch (error) {
        loader?.error(error.message)
        methods.setError('signature.creation.alert', { type: error.message })
      } finally {
        loader?.finish()
      }
    }

    const processFile = async () => {
      const loader = await navigator?.invokeLoading()
      const content = methods.getValues('signature.creation.file')
      const encoder = new TextEncoder()
      methods.setValue('signature.creation.creationDate', new Date().toISOString())
      setFileContent(encoder.encode(content))
      if (handler && handler.wallet) {
        methods.setValue(
          'signature.creation.documentHash',
          handler.wallet.ssi.crypto.hash(content)
        )
      }
      try {
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
        }

        reader.onerror = () => {
          methods.setError('signature.creation.file', { type: 'file.error' })
        }

        reader.onload = () => {
          const data = reader.result as ArrayBuffer
          setFileContent(data)

          const decoder = new TextDecoder("utf-8")
          try {
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
        'signature.creation.authorId': generalNameVlidation(false),
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

            <FormMainAction {..._props} title="signature.creation.create" action={methods.handleSubmit(create)} />
          </PrimaryForm>
        }
      </WalletFormProvider>
    </Fragment>
  })

export type SignatureCreationParams = EmptyProps & { next: () => void }

export type SignatureCreationProps = RegovComponetProps<SignatureCreationParams>

export type SignatureCreationFields = {
  signature: {
    creation: {
      name: string
      description: string
      url: string
      version: string
      author: string
      authorId: string
      file: string
      filename: string
      creationDate: string
      documentHash: string
      docType: string
      alert: string
    }
  }
}
