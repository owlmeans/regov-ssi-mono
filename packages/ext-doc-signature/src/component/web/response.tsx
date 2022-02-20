import { DialogActions, DialogContent } from '@mui/material'
import { EmptyProps, RegovComponentProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import { CredentialSelector, LongOutput, MainTextOutput, PrimaryForm, WalletFormProvider } from '@owlmeans/regov-mold-wallet-web'
import { getCompatibleSubject, Presentation, Credential, REGISTRY_TYPE_CREDENTIALS, CredentialWrapper } from '@owlmeans/regov-ssi-core'
import { Extension } from '@owlmeans/regov-ssi-extension'
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  REGOV_EXT_SIGNATURE_NAMESPACE, SignatureRequestSubject, REGOV_CREDENTIAL_TYPE_SIGNATURE, SignatureSubject
} from '../../types'
import { getSignatureRequestFromPresentation } from '../../util'


export const SignatureResponseWeb: FunctionComponent<SignatureResponseParams> =
  withRegov<SignatureResponseProps>({ namespace: REGOV_EXT_SIGNATURE_NAMESPACE },
    ({ t, i18n, credential: presentation }) => {
      const { handler } = useRegov()
      const credential = getSignatureRequestFromPresentation(presentation) as Credential
      const subject = getCompatibleSubject<SignatureRequestSubject>(credential)

      const methods = useForm<SignatureResponseFields>({
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: {
          signature: {
            request: subject,
            response: {
              vc: '',
              description: '',
              documentHash: '',
              url: '',
              authorId: '',
              version: ''
            }
          }
        }
      })

      const props = { t, i18n }

      const [signatures, setSignatures] = useState<CredentialWrapper[]>([])
      const [defaultId, setDefaultId] = useState<string | undefined>(undefined)

      useEffect(() => {
        (async () => {
          const signatures = await handler.wallet?.getRegistry(REGISTRY_TYPE_CREDENTIALS)
            .lookupCredentials(REGOV_CREDENTIAL_TYPE_SIGNATURE)
          setSignatures(signatures || [])
          const signatureAlike = signatures?.find(wrapper => {
            const credSubject = wrapper.credential.credentialSubject as unknown as SignatureSubject
            if (subject.documentHash && subject.documentHash !== '' && credSubject.documentHash !== subject.documentHash) {
              return false
            }
            if (subject.url && subject.url !== '' && subject.url !== credSubject.url) {
              return false
            }
            if (subject.version && subject.version !== '' && subject.version !== credSubject.version) {
              return false
            }
            if (subject.authorId && subject.authorId !== '' && subject.authorId !== credSubject.authorId) {
              return false
            }

            return true
          })
          if (signatureAlike) {
            setDefaultId(signatureAlike.credential.id)
            methods.setValue('signature.response.vc', signatureAlike.credential.id)
          }
        })()
      }, [presentation.id])

      const currentSignature = signatures.find(
        signature => signature.credential.id === methods.getValues('signature.response.vc')
      )
      const currentSubject = currentSignature?.credential.credentialSubject as unknown as SignatureSubject

      useEffect(() => {
        ['documentHash', 'description', 'url', 'authorId', 'version'].map(
          key => currentSubject && methods.setValue(`signature.response.${key}` as any, currentSubject[key])
        )
      }, [currentSignature?.credential.id])

      return <Fragment>
        <DialogContent>
          <WalletFormProvider {...methods}>
            <PrimaryForm {...props} title="signature.response.title">
              {subject.description && subject.description !== ''
                && <LongOutput {...props} field="signature.request.description" longRead />}
              {subject.url && subject.url !== ''
                && <MainTextOutput {...props} field="signature.request.url" showHint />}
              {subject.authorId && subject.authorId !== ''
                && <MainTextOutput {...props} field="signature.request.authorId" showHint />}
              {subject.version && subject.version !== ''
                && <MainTextOutput {...props} field="signature.request.version" showHint />}
              {subject.documentHash && subject.documentHash !== ''
                && <MainTextOutput {...props} field="signature.request.documentHash" showHint />}

              <CredentialSelector {...props} field="signature.response.vc"
                credentials={signatures} defaultId={defaultId} />

              {currentSubject?.documentHash && currentSubject.documentHash !== ''
                && <MainTextOutput {...props} field="signature.response.documentHash" showHint />}
              {currentSubject?.description && currentSubject.description !== ''
                && <LongOutput {...props} field="signature.response.description" longRead />}
              {currentSubject?.url && currentSubject.url !== ''
                && <MainTextOutput {...props} field="signature.response.url" showHint />}
              {currentSubject?.authorId && currentSubject.authorId !== ''
                && <MainTextOutput {...props} field="signature.response.authorId" showHint />}
              {currentSubject?.version && currentSubject.version !== ''
                && <MainTextOutput {...props} field="signature.response.version" showHint />}

            </PrimaryForm>
          </WalletFormProvider>
        </DialogContent>
        <DialogActions>

        </DialogActions>
      </Fragment>
    })

export type SignatureResponseParams = EmptyProps & {
  ext: Extension
  credential: Presentation
  close?: () => void
}

export type SignatureResponseProps = RegovComponentProps<SignatureResponseParams>

export type SignatureResponseFields = {
  signature: {
    request: SignatureRequestSubject
    response: SignatureRequestSubject & {
      vc: string
    }
  }
}