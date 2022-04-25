import { Credential, Presentation } from "@owlmeans/regov-ssi-core"


export const buildServerClient = (config: ServerClientConfig) => {
  const _server: ServerClient = {
    getVC: async (uri) => {
      const result = await fetch(config.baseUrl + '/' + uri)
      return await result.json()
    }
  }

  return _server
}


export type ServerClient = {
  getVC: <Type extends Credential | Presentation = Presentation>(uri: string) => Promise<Type>
}

export type ServerClientConfig = {
  baseUrl: string
}