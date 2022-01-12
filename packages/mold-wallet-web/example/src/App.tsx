import {
  buildIdentityExtensionUI,
  REGOV_IDENTITY_DEFAULT_TYPE
} from '@owlmeans/regov-ext-identity-web'
import {
  buildUIExtensionRegistry,
} from '@owlmeans/regov-lib-react'
import {
  WalletApp,
  buildUniversalExtensionUI,
} from '@owlmeans/regov-mold-wallet-web'
import {
  UniversalCredentialT
} from '@owlmeans/regov-ssi-extension'
import groupsExtension, { RegovGroupExtensionTypes } from '@owlmeans/regov-ext-groups-web'

import { config } from './config'


const EXAMPLE_IDENTITY_TYPE = 'ExampleIdentity'
type IdentityType = typeof EXAMPLE_IDENTITY_TYPE | typeof REGOV_IDENTITY_DEFAULT_TYPE

const registry = buildUIExtensionRegistry<
  UniversalCredentialT
  | IdentityType
  | RegovGroupExtensionTypes
>()

registry.registerSync<UniversalCredentialT>(buildUniversalExtensionUI({
  name: '',
  code: 'example-uvc',
  organization: 'Example Org.',
  home: 'https://my-example.org/',
  schemaBaseUrl: 'https://my-example.org/schemas/'
}))

registry.registerSync<IdentityType>(buildIdentityExtensionUI(EXAMPLE_IDENTITY_TYPE, { appName: config.name }, {
  name: '',
  code: 'example-identity',
  organization: 'Example Org.',
  home: 'https://my-example.org/',
  schemaBaseUrl: 'https://my-example.org/schemas/'
}))

registry.registerSync<RegovGroupExtensionTypes>(groupsExtension)

export const App = () => {
  return <WalletApp config={config} extensions={registry.normalize()} />
}