import {
  CredentialWrapper,
  REGISTRY_SECTION_OWN,
  REGISTRY_TYPE_UNSIGNEDS
} from '@owlmeans/regov-ssi-core'
import React, {
  FunctionComponent
} from 'react'
import {
  RegovCompoentProps,
  withRegov,
  WrappedComponentProps
} from '../../common'


export const CredentialList: FunctionComponent<CredentialListParams> = withRegov<
  CredentialListProps
>('CredentialList',
  ({ t, i18n, credentials, renderer: Renderer }) => {
    const _props: CredentialListImplProps = {
      t, i18n,
      credentials: credentials
    }
    console.log(credentials)

    return <Renderer {..._props} />
  },
  {
    namespace: 'regov-wallet-credential', transformer: (wallet) => {
      return {
        credentials: wallet?.getRegistry(REGISTRY_TYPE_UNSIGNEDS)
          .registry.credentials[REGISTRY_SECTION_OWN] || []
      }
    }
  }
)


export type CredentialListParams = {

}

export type CredentialListState = {
  credentials: CredentialWrapper[]
}

export type CredentialListProps = RegovCompoentProps<
  CredentialListParams, CredentialListImplProps, CredentialListState
>

export type CredentialListImplProps = WrappedComponentProps<
  CredentialListImplParams, CredentialListState
>

export type CredentialListImplParams = {
}