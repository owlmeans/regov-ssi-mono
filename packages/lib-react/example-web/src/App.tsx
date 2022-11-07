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

import { buildUIExtensionRegistry } from '@owlmeans/regov-lib-react'

import { buildIdentityExtensionUI } from '@owlmeans/regov-ext-identity'
import { signatureWebExtension } from '@owlmeans/regov-ext-doc-signature'
import { groupsUIExtension } from '@owlmeans/regov-ext-groups'
import { authUIExtension } from '@owlmeans/regov-ext-auth'
import { buildCommUIExtension } from '@owlmeans/regov-ext-comm'

import { WalletApp } from '@owlmeans/regov-lib-react'

import { config, commConfig } from './config'

import './warmup'


const EXAMPLE_IDENTITY_TYPE = 'ExampleIdentity'

const registry = buildUIExtensionRegistry()

registry.registerSync(buildCommUIExtension(commConfig))

registry.registerSync(authUIExtension)

registry.registerSync(buildIdentityExtensionUI(EXAMPLE_IDENTITY_TYPE, { appName: config.name }, {
  name: '',
  code: 'example-identity',
  organization: 'Example Org.',
  home: 'https://my-example.org/',
  schemaBaseUrl: 'https://my-example.org/schemas/'
}))

registry.registerSync(signatureWebExtension)

registry.registerSync(groupsUIExtension)

export const App = () => {
  return <WalletApp config={config} extensions={registry.normalize()} />
}