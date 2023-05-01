/**
 *  Copyright 2023 OwlMeans
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

require('dotenv').config()
import cors from "cors"
import {
  buildApp, buildFileStore, buildRotuer, buildServerExtensionRegistry,
  ServerAppConfig
} from "@owlmeans/regov-lib-node"
import { createWalletHandler } from "@owlmeans/regov-ssi-core"
import { buildIdentityExtensionServer } from "@owlmeans/regov-ext-identity/dist/index.server"
import { authServerExtension } from "@owlmeans/regov-ext-auth/dist/index.server"
import { groupsServerExtension } from "@owlmeans/regov-ext-groups/dist/index.server"
import { addCredential } from "@owlmeans/regov-ext-custom/dist/utils"
import { updateFactories } from "@owlmeans/regov-ext-custom/dist/utils/extension"
import {
  USE_CLAIM_VIEW, USE_CREATE_CLAIM, USE_CREATE_OFFER, USE_CRED_VIEW, USE_ITEM_CLAIM,
  USE_ITEM_CRED, USE_ITEM_OFFER, USE_PREVIEW_CLAIM, USE_VIEW_OFFER
} from "@owlmeans/regov-ext-custom/dist/custom.types"

import './warmup'

import util from 'util'
util.inspect.defaultOptions.depth = 8


const EXAMPLE_IDENTITY_TYPE = 'ExampleIdentity'

const config: ServerAppConfig = {
  walletConfig: {
    prefix: process.env.DID_PREFIX,
    defaultSchema: process.env.DID_SCHEMA,
    didSchemaPath: process.env.DID_SCHEMA_PATH
  },
  peerVCs: __dirname + '/../vcs',
  port: parseInt(process.env.SERVER_PORT || '3000')
}

const identity = buildIdentityExtensionServer(
  EXAMPLE_IDENTITY_TYPE, { appName: 'Regov example server wallet' },
  {
    name: '',
    code: 'example-identity',
    organization: 'Example Org.',
    home: 'https://my-example.org/',
    schemaBaseUrl: 'https://my-example.org/schemas/'
  }
)

const registry = buildServerExtensionRegistry()
registry.registerSync(identity)
registry.registerSync(authServerExtension)

groupsServerExtension.extension = updateFactories(addCredential(groupsServerExtension.extension, {
  mainType: 'RoySupport',
  defaultLabel: 'Доверие от ROY.TEAM',
  expirationPeriod: 3600 * 24 * 365 / 2,
  credentialContext: {
    xs: 'http://www.w3.org/2001/XMLSchema#',
    custom: 'https://roy.team/ssi/vc/support#',
  },
  subjectMeta: {
    secretWord: {
      useAt: [USE_CREATE_CLAIM, USE_PREVIEW_CLAIM, USE_CLAIM_VIEW],
      defaultLabel: 'Кодовое слово',
      defaultHint: 'Эмитент по этому кодовому слову может догадаться что это вы',
      validation: { required: true },
      term: { '@id': 'custom:contactName', '@type': 'xs:string' },
    },
    specialMark: {
      useAt: [USE_CREATE_OFFER, USE_ITEM_OFFER, USE_VIEW_OFFER],
      defaultLabel: 'Отметка эмитента',
      defaultHint: 'Должна содержать техническое значение заключения OK или любое другое значение в случае отказа',
      validation: { required: true },
      term: { '@id': 'custom:specialMark', '@type': 'xs:string' },
    },
  },
}))

registry.registerSync(groupsServerExtension)


buildApp({
  config,
  store: buildFileStore(__dirname + '/../store'),
  handler: createWalletHandler(),
  router: buildRotuer(),
  extensions: registry
}).then(app => {
  app.app.use(cors())
  app.start()
})