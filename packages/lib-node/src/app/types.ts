
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