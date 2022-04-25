
import { WalletHandler, WalletOptions } from '@owlmeans/regov-ssi-core'
import { Application } from 'express'


export type RegovServerApp = {
  app: Application
  handler: WalletHandler
}

export type ServerAppConfig = {
  walletConfig: WalletOptions
  wallet?: {
    alias?: string
    password?: string
  }
  peerVCs?: string
}

export const DEFAULT_STORE_PASSWORD = 'securepassword'

export const ERROR_NO_PEER_VCS = 'ERROR_NO_PEER_VCS'
export const ERROR_NO_WALLET = 'ERROR_NO_WALLET'

export const APP_EVENT_PRODUCE_IDENTITY = 'app:identity:produce'