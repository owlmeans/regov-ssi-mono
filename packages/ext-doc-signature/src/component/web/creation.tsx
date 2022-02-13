import { EmptyProps, RegovComponetProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import {
  AlertOutput, dateFormatter, FileProcessorWeb, FormMainAction, LongTextInput, MainTextInput,
  MainTextOutput, PrimaryForm, WalletFormProvider
} from '@owlmeans/regov-mold-wallet-web'
import { Extension } from '@owlmeans/regov-ssi-extension'
import React, { Fragment, FunctionComponent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DOCUMENT_TYPE_JSON, DOCUMENT_TYPE_TEXT, DOCUMENT_TYPE_BINARY } from '../../types'
import { typeFormatterFacotry } from '../formatter'
const isUtf8 = require('is-utf8') as (arg: any) => boolean


export const SignatureCreation = (ext: Extension): FunctionComponent<SignatureCreationParams> =>
  withRegov<SignatureCreationProps>({ namespace: ext.localization?.ns }, (props) => {
    const { handler } = useRegov()

    const methods = useForm<SignatureCreationFields>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        signature: {
          creation: {
            file: '',
            filename: '',
            creationDate: '',
            documentHash: '',
            type: ''
          }
        }
      }
    })

    const [fileContent, setFileContent] = useState<ArrayBuffer | undefined>(undefined)
    const [isCode, setIsCode] = useState<boolean>(false)

    const create = () => {
    }

    const processFile = () => {
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
          methods.setValue('signature.creation.type', DOCUMENT_TYPE_JSON)
        }
      } catch (error) {
        methods.setValue('signature.creation.type', DOCUMENT_TYPE_TEXT)
        console.error(error)
      }
    }

    const onDrop = async (files: File[]) => {
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
                methods.setValue('signature.creation.type', DOCUMENT_TYPE_JSON)
                return
              }
            } catch (error) {
              console.error(error)
            }
            if (isUtf8(Buffer.from(data))) {
              methods.setValue('signature.creation.type', DOCUMENT_TYPE_TEXT)
            } else {
              methods.setValue('signature.creation.type', DOCUMENT_TYPE_BINARY)
            }
          } catch (error) {
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
          }
        }

        reader.readAsArrayBuffer(files[0])
      }
    }

    const filename = methods.watch('signature.creation.filename')

    return <Fragment>
      <WalletFormProvider {...methods}>
        {!fileContent
          ? <FileProcessorWeb {...props} field="signature.creation.file"
            isCode={isCode} onDrop={onDrop} process={processFile} />
          : <Fragment>
            <PrimaryForm {...props} title="signature.creation.title">
              <MainTextInput {...props} field="signature.creation.name" />
              <LongTextInput {...props} field="signature.creation.description" />
              <MainTextInput {...props} field="signature.creation.url" />
              <MainTextInput {...props} field="signature.creation.version" />
              <MainTextInput {...props} field="signature.creation.author" />
              <MainTextInput {...props} field="signature.creation.authorId" />
              <MainTextOutput {...props} field="signature.creation.documentHash" showHint />
              <MainTextOutput {...props} field="signature.creation.type" showHint formatter={
                typeFormatterFacotry(props.t)
              } />
              {
                filename && filename !== ''
                && <MainTextOutput {...props} field="signature.creation.filename" showHint />
              }
              <MainTextOutput {...props} field="signature.creation.creationDate" showHint formatter={dateFormatter} />

              <AlertOutput {...props} field="signature.creation.alert" />

              <FormMainAction {...props} title="signature.creation.create" action={methods.handleSubmit(create)} />
            </PrimaryForm>
          </Fragment>
        }
      </WalletFormProvider>
    </Fragment>
  })

export type SignatureCreationParams = EmptyProps & { next: () => void }

export type SignatureCreationProps = RegovComponetProps<SignatureCreationParams>

export type SignatureCreationFields = {
  signature: {
    creation: {
      file: string
      filename: string
      creationDate: string
      documentHash: string
      type: string
    }
  }
}
