import { EmptyProps, RegovComponetProps, withRegov } from '@owlmeans/regov-lib-react'
import {
  AlertOutput, dateFormatter, FormMainAction, LongTextInput, MainTextInput, MainTextOutput,
  PrimaryForm, WalletFormProvider
} from '@owlmeans/regov-mold-wallet-web'
import { Extension } from '@owlmeans/regov-ssi-extension'
import React, { Fragment, FunctionComponent } from 'react'
import { useForm } from 'react-hook-form'
import { FileProcessor } from './file-processor'


export const SignatureCreation = (ext: Extension): FunctionComponent<SignatureCreationParams> =>
  withRegov<SignatureCreationProps>({ namespace: ext.localization?.ns }, (props) => {

    const methods = useForm<SignatureCreationFields>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
      }
    })

    const create = () => {
    }

    return <Fragment>
      <FileProcessor />
      <WalletFormProvider {...methods}>
        <PrimaryForm {...props} title="signature.creation.title">
          <MainTextInput {...props} field="signature.creation.name" />
          <LongTextInput {...props} field="signature.creation.description" />
          <LongTextInput {...props} field="signature.creation.url" />
          <LongTextInput {...props} field="signature.creation.version" />
          <LongTextInput {...props} field="signature.creation.author" />
          <LongTextInput {...props} field="signature.creation.authorId" />
          <MainTextOutput {...props} field="signature.creation.documentHash" showHint />
          <MainTextOutput {...props} field="signature.creation.type" showHint />
          <MainTextOutput {...props} field="signature.creation.filename" showHint />
          <MainTextOutput {...props} field="signature.creation.creationDate" showHint formatter={dateFormatter} />

          <AlertOutput {...props} field="signature.creation.alert" />

          <FormMainAction {...props} title="signature.creation.create" action={methods.handleSubmit(create)} />
        </PrimaryForm>
      </WalletFormProvider>
    </Fragment>
  })

export type SignatureCreationParams = EmptyProps & { next: () => void }

export type SignatureCreationProps = RegovComponetProps<SignatureCreationParams>

export type SignatureCreationFields = {}