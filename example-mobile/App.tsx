global.Buffer = require('buffer/').Buffer

import React from 'react'
import { WalletAppMobile } from './src'
import { buildUIExtensionRegistry } from '@owlmeans/regov-lib-react/dist/index.mobile'
import { config } from './config'


const registry = buildUIExtensionRegistry()
export default function App() {
  return <WalletAppMobile config={config} extensions={registry.normalize()} />
}

