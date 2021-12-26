import { Config } from "@owlmeans/regov-lib-react";
import { webCryptoHelper } from "@owlmeans/regov-ssi-common";
import { buildWalletWrapper } from "@owlmeans/regov-ssi-core";


export const buildDevWallet = async (config: Config, alias = DEFAULT_DEVELOPMENT_VOICE_ALIAS) =>
  await buildWalletWrapper(
    webCryptoHelper, '11111111', { alias, name: 'Development wallet' }, { 
      prefix: config.DID_PREFIX,
      defaultSchema: config.baseSchemaUrl
    }
  )

export const DEFAULT_DEVELOPMENT_VOICE_ALIAS = 'development'