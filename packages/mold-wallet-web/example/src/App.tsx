import {
  buildUIExtensionRegistry,
  
} from '@owlmeans/regov-lib-react'
import { 
  WalletApp ,
  buildUniversalExtensionUI,
  UniversalCredentailExtension
} from '@owlmeans/regov-mold-wallet-web'

import { config } from './config'


const registry = buildUIExtensionRegistry<UniversalCredentailExtension>()

registry.registerSync(buildUniversalExtensionUI({
  name: '',
  code: 'example-uvc',
  organization: 'Example Org.',
  home: 'https://my-example.org/',
  schemaBaseUrl: 'https://my-example.org/schemas/'
}))

export const App = () => {
  return <WalletApp config={config} extensions={registry} />
}