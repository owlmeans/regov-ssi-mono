import { WalletHandler } from "@owlmeans/regov-ssi-core"


export type ServerStore = {
  init: (handler: WalletHandler) => Promise<void>

  commit: () => Promise<void>
} 