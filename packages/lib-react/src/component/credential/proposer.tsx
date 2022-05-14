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

import { addToValue, normalizeValue } from '@owlmeans/regov-ssi-core'
import {
  isPresentation, Presentation, Credential, SSICore, isCredential, UnsignedCredential,
  buildWalletLoader, WalletWrapper
} from '@owlmeans/regov-ssi-core'
import { 
  DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION, VERIFICATION_KEY_CONTROLLER, VERIFICATION_KEY_HOLDER 
} from '@owlmeans/regov-ssi-core'
import React, { FunctionComponent } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { 
  BasicNavigator, RegovComponentProps, RegovValidationRules, withRegov, WrappedComponentProps
} from '../../common/'
import { validateJson } from '../../util'
import { LIBREACT_HOLDER_ISNT_UNSIGNEDID } from './types'


export const CredentialProposer: FunctionComponent<CredentialProposerParams> =
  withRegov<CredentialProposerProps, BasicNavigator>({
    namespace: 'regov-wallet-credential',
    transformer: (wallet, _) => {
      return { ssi: wallet?.ssi, wallet }
    }
  }, ({
    t, i18n, ssi, wallet, navigator,
    offerType, claimType,
    com: ComRenderer,
    renderer: FallbackRenderer
  }) => {
    const Renderer: FunctionComponent<CredentialProposerImplProps> = ComRenderer || FallbackRenderer

    const _props: CredentialProposerImplProps = {
      t, i18n,

      rules: credentialProposerValidatorRules,

      form: {
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: {
          proposer: {
            claim: '{}',
            issuer: '{}',
            alert: undefined,
          },
          outout: undefined
        }
      },

      offer: methods => async data => {
        const loading = await navigator?.invokeLoading()
        try {
          if (!ssi) {
            methods.setError('proposer.alert', { type: 'authenticated' })
            return
          }

          const claim = JSON.parse(data.proposer.claim) as Presentation
          if (!isPresentation(claim)) {
            methods.setError('proposer.alert', { type: 'proposer.claim.format' })
            return
          }
          if (!claim || !claim.verifiableCredential.length) {
            methods.setError('proposer.alert', { type: 'proposer.claim.no' })
            return
          }
          if (claimType) {
            if (normalizeValue(claimType).some(
              type => !normalizeValue(claim.type).includes(type)
            )) {
              methods.setError('proposer.alert', { type: 'proposer.claim.type' })
              return
            }
          }

          const [isClaimValid, claimValidation] = await ssi.verifyPresentation(claim, undefined, {
            testEvidence: true,
            /** 
             * @TODO Allow to regulate evidence trust
             */
            nonStrictEvidence: true,
            localLoader: wallet ? buildWalletLoader(wallet) : undefined
          })
          if (!isClaimValid) {
            if (claimValidation.kind === 'invalid') {
              methods.setError('proposer.alert', { message: claimValidation.errors[0].message })
              return
            }
          }
          const evidence = JSON.parse(data.proposer.issuer) as Credential
          if (!evidence) {
            methods.setError('proposer.alert', { type: 'proposer.issuer.no' })
            return
          }
          if (!isCredential(evidence)) {
            methods.setError('proposer.alert', { type: 'proposer.issuer.format' })
            return
          }
          const [isIssuerValid, issuerValidation] = await ssi.verifyCredential(evidence)
          if (!isIssuerValid) {
            if (issuerValidation.kind === 'invalid') {
              methods.setError('proposer.alert', { message: issuerValidation.errors[0].message })
              return
            }
          }
          const issuer = evidence.issuer
          if (!ssi.did.helper().isDIDDocument(issuer)) {
            methods.setError('proposer.alert', { type: 'proposer.issuer.didformat' })
            return
          }
          const signerKey = await ssi.did.helper().extractKey(issuer, VERIFICATION_KEY_HOLDER)
          delete signerKey?.fragment 
          if (!signerKey) {
            methods.setError('proposer.alert', { type: 'proposer.issuer.key' })
            return
          }
          await ssi.keys.expandKey(signerKey)
          if (!signerKey.pk) {
            methods.setError('proposer.alert', { type: 'proposer.issuer.pk' })
            return
          }
          const unsigneds = normalizeValue(claim.verifiableCredential).map(
            cred => {
              const unsigned: any = { ...cred }
              unsigned.holder = { ...unsigned.issuer }
              delete unsigned.issuer
              delete unsigned.holder.proof
              delete unsigned.proof
              normalizeValue(claimType).map(type => {
                const idx = unsigned.type.findIndex((_type: string) => _type === type)
                if (idx > 0) {
                  (unsigned.type as string[]).splice(idx, 1)
                }
              })
              unsigned.evidence = addToValue(unsigned.evidence, evidence)
              return unsigned as UnsignedCredential
            }
          )
          const signeds = await Promise.all(unsigneds.map(async unsigned => {
            if (!ssi.did.helper().isDIDUnsigned(unsigned.holder)) {
              throw LIBREACT_HOLDER_ISNT_UNSIGNEDID
            }
            const issuer = await ssi.did.helper().signDID(
              signerKey, unsigned.holder, VERIFICATION_KEY_CONTROLLER,
              [DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
            )
            unsigned.holder = { id: unsigned.holder.id }

            return ssi.signCredential(unsigned, issuer, { keyId: VERIFICATION_KEY_CONTROLLER })
          }))

          const unsignedOffer = await ssi.buildPresentation(signeds, {
            holder: issuer,
            type: offerType
          })

          const offer = await ssi.signPresentation(unsignedOffer, issuer, {
            challenge: claim.proof.challenge
          })

          methods.setValue('output', JSON.stringify(offer, undefined, 2))
        } catch (error) {
          loading?.error(error)
          console.error(error)
        } finally {
          loading?.finish()
        }
      }
    }

    return <Renderer {..._props} />
  })

export const credentialProposerValidatorRules: RegovValidationRules = {
  'proposer.claim': {
    required: true,
    validate: {
      json: validateJson
    }
  },
  'proposer.issuer': {
    required: true,
    validate: {
      json: validateJson
    }
  }
}

export type CredentialProposerParams = {
  ns?: string,
  offerType?: string
  claimType?: string | string[]
  com?: FunctionComponent
}

export type CredentialProposerFields = {
  proposer: {
    claim: string
    issuer: string
    alert: string | undefined
  },
  output: string | undefined
}

export type CredentialProposerProps = RegovComponentProps<
  CredentialProposerParams, CredentialProposerImplParams, CredentialProposerState
>

export type CredentialProposerState = {
  ssi?: SSICore,
  wallet?: WalletWrapper
}

export type CredentialProposerImplParams = {
  offer: (
    methods: UseFormReturn<CredentialProposerFields>
  ) => (data: CredentialProposerFields) => Promise<void>
}

export type CredentialProposerImplProps = WrappedComponentProps<CredentialProposerImplParams>