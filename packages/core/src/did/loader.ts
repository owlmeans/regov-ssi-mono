/**
 *  Copyright 2022 OwlMeans
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

import { BuildDocumentLoader, DocumentWarmer } from "./types"
import { DIDRegistryWrapper } from "./types/registry"


const documentCache: { [key: string]: any } = {}

export const buildDocumentLoader = (did: DIDRegistryWrapper): BuildDocumentLoader =>
  (fallback?) => async (url) => {
    if (url.startsWith('did:')) {
      return {
        contextUrl: null,
        document: (
          did =>
            JSON.parse(JSON.stringify(did || (fallback ? fallback() : {})))
        )(await did.lookUpDid(url)),
        documentUrl: url,
      }
    }

    if (documentCache[url]) {
      return documentCache[url]
    }

    return documentCache[url] = await require('jsonld').documentLoader(url)
  }

export const documentWarmer: DocumentWarmer =
  (url, docJson) => {
    documentCache[url] = {
      contextUrl: null,
      document: docJson,
      documentUrl: url,
    }
  }