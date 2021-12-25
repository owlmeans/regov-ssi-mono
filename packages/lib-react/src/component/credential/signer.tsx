import { addToValue } from '@owlmeans/regov-ssi-common'
import {
  SSICore,
  UnsignedCredential,
  Credential,
} from '@owlmeans/regov-ssi-core'
import { 
  DIDDocument, 
  DIDDocumentUnsinged, 
  VERIFICATION_KEY_CONTROLLER, 
  VERIFICATION_KEY_HOLDER 
} from '@owlmeans/regov-ssi-did'
import React, {
  FunctionComponent
} from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  BasicNavigator,
  RegovCompoentProps,
  RegovValidationRules,
  withRegov,
  WrappedComponentProps
} from '../../common'
import { validateJson } from '../../util'


export const CredentialSigner: FunctionComponent<CredentialSignerParams> =
  withRegov<CredentialSignerProps, BasicNavigator>({
    namespace: 'regov-wallet-credential',
    transformer: (wallet, _) => {
      return { ssi: wallet?.ssi }
    }
  }, ({
    t, i18n, ssi, navigator,
    com: ComRenderer,
    renderer: FallbackRenderer
  }) => {
    const Renderer = ComRenderer || FallbackRenderer

    const _props: CredentialSignerImplProps = {
      t, i18n,

      rules: credentialSignerValidatorRules,

      form: {
        mode: 'onChange',
        criteriaMode: 'all',
        defaultValues: {
          signer: {
            unsigned: '{}',
            evidence: '',
            alert: undefined,
          },
          outout: undefined
        }
      },

      sign: methods => async data => {
        const loading = await navigator?.invokeLoading()
        try {
          if (!ssi) {
            methods.setError('signer.alert', { type: 'authenticated' })
            return
          }

          const unsigned = JSON.parse(data.signer.unsigned) as UnsignedCredential
          const unsignedDid = unsigned.holder as DIDDocumentUnsinged
          let issuer: DIDDocument | undefined = undefined

          if (data.signer.evidence !== '') {
            const evidence = JSON.parse(data.signer.evidence) as Credential
            const signer = evidence.holder['@context']
              ? evidence.holder as DIDDocument
              : evidence.issuer
            const signerKey = await ssi.did.helper().extractKey(signer, VERIFICATION_KEY_HOLDER)
            if (!signerKey) {
              methods.setError('signer.alert', { type: 'evidence.holder.key' })
              return
            }
            await ssi.keys.expandKey(signerKey)
            if (!signerKey.pk) {
              methods.setError('signer.alert', { type: 'evidence.holder.pk' })
              return
            }
            if (!signer || typeof signer === 'string') {
              methods.setError('signer.alert', { type: 'evidence.signer.type' })
              return
            }
            issuer = signer
            unsigned.evidence = addToValue(unsigned.evidence, evidence)
            unsigned.holder = await ssi.did.helper().signDID(signerKey, unsignedDid, VERIFICATION_KEY_CONTROLLER)
          } else {
            const signerKey = await ssi.did.helper().extractKey(unsignedDid, VERIFICATION_KEY_HOLDER)
            if (!signerKey) {
              methods.setError('signer.alert', { type: 'evidence.holder.key' })
              return
            }
            await ssi.keys.expandKey(signerKey)
            if (!signerKey.pk) {
              methods.setError('signer.alert', { type: 'evidence.holder.pk' })
              return
            }
            issuer = await ssi.did.helper().signDID(signerKey, unsignedDid)
            unsigned.holder = { id: issuer.id }
          }

          const cred = await ssi.signCredential(unsigned, issuer, { keyId: VERIFICATION_KEY_HOLDER })

          methods.setValue('output', JSON.stringify(cred, undefined, 2))
        } catch (error) {
          loading?.error(error)
          console.log(error)
        } finally {
          loading?.finish()
        }
      }
    }

    return <Renderer {..._props} />
  })

export const credentialSignerValidatorRules: RegovValidationRules = {
  'signer.unsigned': {
    required: true,
    validate: {
      json: validateJson
    }
  },
  'signer.evidence': {
    validate: {
      json: (v: string) => v === '' || validateJson(v)
    }
  }
}

export type CredentialSignerParams = {
  ns?: string,
  com?: FunctionComponent
}

export type CredentialSignerFields = {
  signer: {
    unsigned: string
    evidence: string
    alert: string | undefined
  },
  output: string | undefined
}

export type CredentialSignerProps = RegovCompoentProps<
  CredentialSignerParams, CredentialSignerImplParams, CredentialSignerState
>

export type CredentialSignerState = {
  ssi?: SSICore
}

export type CredentialSignerImplParams = {
  sign: (
    methods: UseFormReturn<CredentialSignerFields>
  ) => (data: CredentialSignerFields) => Promise<void>
}

export type CredentialSignerImplProps = WrappedComponentProps<CredentialSignerImplParams>