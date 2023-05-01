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

import { EventParams, ExtensionRegistry, WalletHandler, WalletOptions } from '@owlmeans/regov-ssi-core'
import { Application } from 'express'
import { ServerExtensionRegistry } from '../extension'


export type RegovServerApp = {
  app: Application
  extensions: ServerExtensionRegistry
  handler: WalletHandler
  start: () => void
}

export type ServerAppConfig = {
  walletConfig: WalletOptions
  wallet?: {
    alias?: string
    password?: string
  }
  peerVCs?: string
  port: number
}

export const DEFAULT_STORE_PASSWORD = 'securepassword'

export const ERROR_NO_PEER_VCS = 'ERROR_NO_PEER_VCS'
export const ERROR_NO_WALLET = 'ERROR_NO_WALLET'

export const APP_EVENT_PRODUCE_IDENTITY = 'app:identity:produce'

export type ServerEventProduceIdentityParams = EventParams & {
  extensions: ExtensionRegistry
}