import React, {
  FunctionComponent
} from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  EmptyProps,
  RegovCompoentProps,
  useRegov,
  withRegov,
  WrappedComponentProps
} from '../../common'
import {
  EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED,
  IncommigDocumentEventParams
} from '@owlmeans/regov-ssi-extension'
import {
  validateJsonOrEmpty
} from '../../util'


export const CredentialProcessor: FunctionComponent<CredentialProcessorParams> = withRegov<
  CredentialProcessorProps
>(
  'CredentialProcessor', ({
    t, i18n, navigator, renderer: Renderer
  }) => {
  const { extensions, handler } = useRegov()

  const _props: CredentialProcessorImplProps = {
    t, i18n,

    form: {
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        document: '',
        alert: undefined
      }
    },

    rules: {
      'document': {
        validate: { json: validateJsonOrEmpty }
      }
    },

    process: methods => async data => {
      const loading = await navigator?.invokeLoading()
      try {
        if (data.document === '') {
          return
        }
        if (!handler.wallet || !extensions?.triggerEvent) {
          methods.setError('document', { type: 'authenticated' })
          return
        }
        const statusHandler = {
          successful: false
        }
        await extensions.triggerEvent<IncommigDocumentEventParams<string>>(
          handler.wallet, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, {
          credential: JSON.parse(data.document), statusHandler,
          cleanUp: () => methods.setValue('document', '')
        })
        if (!statusHandler.successful) {
          methods.setError('document', { type: 'unknown' })
          return
        }
      } catch (error) {
        loading?.error(error.message)
        console.log(error)
      } finally {
        loading?.finish()
      }
    }
  }

  return <Renderer {..._props} />
}, { namespace: 'regov-wallet-credential' })


export type CredentialProcessorParams = EmptyProps & {
}

export type CredentialProcessorProps = RegovCompoentProps<
  CredentialProcessorParams, CredentialProcessorImplParams
>

export type CredentialProcessorFields = {
  document: string
  alert: string | undefined
}

export type CredentialProcessorImplParams = {
  process: (methods: UseFormReturn<CredentialProcessorFields>) =>
    (data: CredentialProcessorFields) => Promise<void>
}

export type CredentialProcessorImplProps = WrappedComponentProps<CredentialProcessorImplParams>
