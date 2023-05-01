/**
 *  Copyright 2023 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Credential, Presentation } from "@owlmeans/regov-ssi-core"

const _buildHeaders = (
  config: ServerClientConfig, params?: ServierClientRequest
): Record<string, string> => {
  return {
    'Content-Type': 'application/json', ...(config.headers ?? {}),
    ...(params?.headers ?? {})
  }
}

export const buildServerClient = (config: ServerClientConfig) => {
  const _server: ServerClient = {
    getVC: async (uri) => {
      const [url, params] = uriToUrlAndConfig(uri, config)
      const result = params.params ? await fetch(url, {
        method: 'POST', body: JSON.stringify(params.params),
        headers: _buildHeaders(config, params)
      }) : await fetch(url)

      return result.json()
    },

    getVCs: async (uri) => {
      const [url, params] = uriToUrlAndConfig(uri, config)
      const result = params.params ? await fetch(url, {
        method: 'POST', body: JSON.stringify(params.params),
        headers: _buildHeaders(config, params)
      }) : await fetch(url)

      return result.json()
    },

    sendVC: async (uri, cred) => {
      const [url, params] = uriToUrlAndConfig(uri, config)
      const result = await fetch(
        url, {
        body: JSON.stringify(cred), method: 'POST',
        headers: _buildHeaders(config, params)
      })

      return result.json()
    }
  }

  return _server
}

const uriToUrlAndConfig = (uri: string | ServierClientRequest, config: ServerClientConfig): [string, ServierClientRequest] => {
  if (typeof uri === 'string') {
    return [config.baseUrl.replace(/\/+$/, '') + '/' + uri.replace(/^\/+/, ''), {}]
  }

  const baseUrl = uri.fullUrl
    || (uri.serverAlias && config.servers && config.servers[uri.serverAlias]
      ? config.servers[uri.serverAlias] : config.baseUrl)

  return [baseUrl.replace(/\/+$/, '') + '/' + (uri.uri || '').replace(/^\/+/, ''), uri]
}


export type ServerClient = {
  getVC: <Type extends Credential | Presentation = Presentation>(
    uri: string | ServierClientRequest
  ) => Promise<Type>

  getVCs: <Type extends Credential[] = Credential[]>(
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
  headers?: Record<string, string>
  params?: Record<string, any>
}

export type ServerClientConfig = {
  baseUrl: string
  headers?: Record<string, string>
  servers?: { [alias: string]: string }
}

export type ServerClientSentVCResult<Result extends {}> = {
  message?: string
  error?: string
  data?: Result
} | Result