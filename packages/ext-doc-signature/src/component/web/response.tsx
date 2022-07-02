/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { EmptyProps, RegovComponentProps, useRegov, withRegov } from '@owlmeans/regov-lib-react'
import {
  AlertOutput, CredentialActionGroup, CredentialSelector, dateFormatter, EntityRenderer,
  EntityTextRenderer, LongOutput, MainTextOutput, PrimaryForm, WalletFormProvider
} from '@owlmeans/regov-lib-react'
import { singleValue } from '@owlmeans/regov-ssi-core'
import {
  getCompatibleSubject, Presentation, Credential, REGISTRY_TYPE_CREDENTIALS, CredentialWrapper
} from '@owlmeans/regov-ssi-core'
import { Extension } from '@owlmeans/regov-ssi-core'
import React, { Fragment, FunctionComponent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  REGOV_EXT_SIGNATURE_NAMESPACE, SignatureRequestSubject, REGOV_CREDENTIAL_TYPE_SIGNATURE, SignatureSubject,
  ERROR_WIDGET_AUTHENTICATION, ERROR_WIDGET_EXTENSION, REGOV_SIGNATURE_RESPONSE_TYPE
} from '../../types'
import { getSignatureRequestFromPresentation } from '../../util'
import { typeFormatterFacotry } from '../formatter'

import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'


export const SignatureResponseWeb: FunctionComponent<SignatureResponseParams> =
  withRegov<SignatureResponseProps>({ namespace: REGOV_EXT_SIGNATURE_NAMESPACE },
    ({ t, i18n, ext, navigator, close, credential: presentation }) => {
      const { handler, extensions } = useRegov()
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
              alert: '',
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
      const [response, setResponse] = useState<Presentation | undefined>(undefined)

      useEffect(() => {
        (async () => {
          if (!extensions || !handler.wallet) {
            methods.setError('signature.response.alert', { type: 'notAuthenticated' })
            return
          }

          const factory = ext.getFactory(credential.type)
          const requestValidation = await factory.validate(handler.wallet, {
            presentation, credential, extensions: extensions.registry
          })

          if (!requestValidation.valid) {
            const cause = singleValue(requestValidation.cause)
            if (!cause) {
              methods.setError('signature.response.alert', { type: 'unknwonValidationError' })
            } else if (typeof cause === 'string') {
              methods.setError('signature.response.alert', { type: cause })
            } else {
              methods.setError('signature.response.alert', {
                type: cause.kind, message: cause.message
              })
            }
            return
          }

          const signatures = await handler.wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS)
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

        if (currentSubject && subject.documentHash && subject.documentHash !== ''
          && subject.documentHash !== currentSubject.documentHash) {
          methods.setError('signature.response.alert', { type: 'wrongHash' })
        } else {
          methods.clearErrors()
        }
      }, [currentSignature?.credential.id])

      const produce = async () => {
        const loader = await navigator?.invokeLoading()
        try {
          if (!handler.wallet) {
            throw ERROR_WIDGET_AUTHENTICATION
          }
          if (!ext) {
            throw ERROR_WIDGET_EXTENSION
          }
          if (!currentSignature) {
            throw new Error('signature.response.noSignature')
          }

          const factory = ext.getFactory(REGOV_SIGNATURE_RESPONSE_TYPE)
          const response = await factory.respond(handler.wallet, {
            request: presentation,
            credential: currentSignature.credential
          })

          setResponse(response)
          loader?.success(t('signature.response.produced'))
        } catch (error) {
          console.error(error)
          loader?.error(error.message)
        } finally {
          loader?.finish()
        }
      }

      return <Fragment>
        <DialogContent>
          {!response
            ? <WalletFormProvider {...methods}>
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

                <AlertOutput {...props} field="signature.response.alert" />
              </PrimaryForm>
            </WalletFormProvider>
            : <EntityRenderer t={t} entity="signature.view" subject={currentSubject}
              title={currentSubject.name}>
              <EntityTextRenderer field="description" showLabel />
              <EntityTextRenderer field="documentHash" showLabel />
              <EntityTextRenderer field="docType" showLabel formatter={typeFormatterFacotry(t)} />
              <EntityTextRenderer field="filename" showLabel />
              <EntityTextRenderer field="url" showLabel />
              <EntityTextRenderer field="creationDate" showLabel formatter={dateFormatter} />
              <EntityTextRenderer field="version" showLabel />
              <EntityTextRenderer field="author" showLabel />
              <EntityTextRenderer field="authorId" showLabel />
              <EntityTextRenderer field="signedAt" showLabel formatter={dateFormatter} />
            </EntityRenderer>}
        </DialogContent>
        <DialogActions>
          {response
            ? <CredentialActionGroup content={response} prettyOutput
              exportTitle={`${currentSignature?.meta.title || currentSubject.name}.response`} />
            : <Button onClick={methods.handleSubmit(produce)}>{`${t('signature.response.produce')}`}</Button>}
          <Button onClick={close}>{`${t('signature.response.close')}`}</Button>
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
      alert: string
    }
  }
}