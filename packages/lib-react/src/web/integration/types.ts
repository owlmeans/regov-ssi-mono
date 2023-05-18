import { WalletHandler } from '@owlmeans/regov-ssi-core'
import { UIExtensionRegistry } from '../../extension'

export interface UneregisterIntegratedWalletPlugin { (): void }

export interface IntegratedWalletPluginParams {
  handler: WalletHandler
  isHandlerPassed?: boolean
  isUnregisterSet?: boolean
  extensions?: UIExtensionRegistry
  setInboxCount?: (count: number) => void
}

export interface IntegratedWalletPlugin {
  (params: IntegratedWalletPluginParams): UneregisterIntegratedWalletPlugin | undefined
}
