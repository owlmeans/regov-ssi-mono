import { DIDCommHelper, WSClientConfig } from "@owlmeans/regov-comm"
import { Extension } from "@owlmeans/regov-ssi-core"


export const REGOV_EXT_COMM_NAMESPACE = 'owlmeans-regov-ext-comm'

export type CommExtConfig = {
  wsConfig: { [alias: string]: WSClientConfig }
}

export type CommExtension = Extension & {
  didComm?: { [alias: string]: DIDCommHelper }
}

export const DEFAULT_SERVER_ALIAS = 'default'