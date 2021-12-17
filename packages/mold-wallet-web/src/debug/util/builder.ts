import { webCryptoHelper } from "@owlmeans/regov-ssi-common";
import { buildWalletWrapper } from "@owlmeans/regov-ssi-core";


export const buildDevWallet = async (prefix: string, alias = DEFAULT_DEVELOPMENT_VOICE_ALIAS) =>
  await buildWalletWrapper(
    webCryptoHelper, '11111111', { alias, name: 'Development wallet' }, { prefix }
  )

export const DEFAULT_DEVELOPMENT_VOICE_ALIAS = 'development'