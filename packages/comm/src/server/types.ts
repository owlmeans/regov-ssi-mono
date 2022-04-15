import { BuildDIDHelperOptions } from "@owlmeans/regov-ssi-core"

export type ServerConfig = {
  subProtocol?: string
  timeout: number
  did: BuildDIDHelperOptions
  message: {
    ttl: number
  }
}

