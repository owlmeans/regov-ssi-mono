import { Credential, Presentation } from "@owlmeans/regov-ssi-core"


export const buildServerClient = (config: ServerClientConfig) => {
  const _server: ServerClient = {
    getVC: async (uri) => {
      const [url] = uriToUrlAndConfig(uri, config)
      const result = await fetch(url)

      return result.json()
    },

    sendVC: async (uri, cred) => {
      const [url] = uriToUrlAndConfig(uri, config)
      const result = await fetch(
        url, {
        body: JSON.stringify(cred), method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log(result)

      return result.json()
    }
  }

  return _server
}

const uriToUrlAndConfig = (uri: string | ServierClientRequest, config: ServerClientConfig): [string, ServierClientRequest] => {
  if (typeof uri === 'string') {
    return [config.baseUrl + uri, {}]
  }

  const baseUrl = uri.fullUrl
    || (uri.serverAlias && config.servers && config.servers[uri.serverAlias]
      ? config.servers[uri.serverAlias] : config.baseUrl)

  return [baseUrl + (uri.uri || ''), uri]
}


export type ServerClient = {
  getVC: <Type extends Credential | Presentation = Presentation>(
    uri: string | ServierClientRequest
  ) => Promise<Type>

  sendVC: <
    Type extends Credential | Presentation = Presentation,
    Result extends {} = {}
    >(
    uri: string | ServierClientRequest, cred: Type
  ) => Promise<Result>
}

export type ServierClientRequest = {
  uri?: string
  fullUrl?: string
  serverAlias?: string
}

export type ServerClientConfig = {
  baseUrl: string
  servers?: { [alias: string]: string }
}

export type ServerClientSentVCResult<Result extends {}> = {
  message?: string
  error?: string
  data?: Result
} | Result