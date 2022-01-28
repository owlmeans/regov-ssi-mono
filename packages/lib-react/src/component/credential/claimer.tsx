import {
  isCredential,
  SSICore,
  UnsignedCredential
} from '@owlmeans/regov-ssi-core'
import {
  DIDDocument,
  DIDDocumentUnsinged,
  VERIFICATION_KEY_HOLDER
} from '@owlmeans/regov-ssi-did'
import React, {
  FunctionComponent
} from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  BasicNavigator,
  RegovComponetProps,
  RegovValidationRules,
  withRegov,
  WrappedComponentProps
} from '../../common'
import { validateJson } from '../../util'


export const CredentialClaimer: FunctionComponent<CredentialClaimerParams> =
  withRegov<CredentialClaimerProps, BasicNavigator>({
    namespace: 'regov-wallet-credential',
    transformer: (wallet, _) => {
      return { ssi: wallet?.ssi }
    }
  }, ({
    t, i18n, ssi, navigator,
    claimType,
    com: ComRenderer,
    renderer: FallbackRenderer
  }) => {
    const Renderer = ComRenderer || FallbackRenderer

    const _props: CredentialClaimerImplProps = {
      t, i18n,

      rules: credentialClaimerValidatorRules,

      form: {
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: {
          claimer: {
            unsigned: '{}',
            holder: '',
            alert: undefined,
          },
          outout: undefined
        }
      },

      claim: methods => async data => {
        const loading = await navigator?.invokeLoading()
        try {
          if (!ssi) {
            methods.setError('claimer.alert', { type: 'authenticated' })
            return
          }

          const unsigned = JSON.parse(data.claimer.unsigned) as UnsignedCredential
          const unsignedDid = unsigned.holder as DIDDocumentUnsinged

          const signerKey = await ssi.did.helper().extractKey(unsignedDid, VERIFICATION_KEY_HOLDER)
          if (!signerKey) {
            methods.setError('claimer.alert', { type: 'claimer.holder.key' })
            return
          }
          await ssi.keys.expandKey(signerKey)
          if (!signerKey.pk) {
            methods.setError('claimer.alert', { type: 'claimer.holder.pk' })
            return
          }
          const issuer = await ssi.did.helper().signDID(signerKey, unsignedDid)
          unsigned.holder = { id: issuer.id }
          if (claimType) {
            unsigned.type.push(claimType)
          }

          const cred = await ssi.signCredential(unsigned, issuer, { keyId: VERIFICATION_KEY_HOLDER })

          let holder: DIDDocument | Credential = data.claimer.holder === ''
            ? cred.issuer
            : JSON.parse(data.claimer.holder)

          if (isCredential(holder)) {
            if (typeof holder.issuer === 'string') {
              methods.setError('claimer.alert', { type: 'claimer.holder.format' })
              return
            }
            holder = holder.issuer
          }

          if (!ssi.did.helper().isDIDDocument(holder)) {
            methods.setError('claimer.alert', { type: 'claimer.holder.format' })
            return
          }

          const unsignedClaim = await ssi.buildPresentation([cred], { holder, type: claimType })
          const claim = await ssi.signPresentation(unsignedClaim, holder)

          methods.setValue('output', JSON.stringify(claim, undefined, 2))
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

export const credentialClaimerValidatorRules: RegovValidationRules = {
  'claimer.unsigned': {
    required: true,
    validate: {
      json: validateJson
    }
  },
  'claimer.holder': {
    validate: {
      json: (v: string) => v === '' || validateJson(v)
    }
  }
}

export type CredentialClaimerParams = {
  ns?: string,
  claimType?: string
  com?: FunctionComponent
}

export type CredentialClaimerFields = {
  claimer: {
    unsigned: string
    holder: string
    alert: string | undefined
  },
  output: string | undefined
}

export type CredentialClaimerProps = RegovComponetProps<
  CredentialClaimerParams, CredentialClaimerImplParams, CredentialClaimerState
>

export type CredentialClaimerState = {
  ssi?: SSICore
}

export type CredentialClaimerImplParams = {
  claim: (
    methods: UseFormReturn<CredentialClaimerFields>
  ) => (data: CredentialClaimerFields) => Promise<void>
}

export type CredentialClaimerImplProps = WrappedComponentProps<CredentialClaimerImplParams>