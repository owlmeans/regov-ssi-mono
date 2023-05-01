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

import { LocalDocumentLoader } from "../vc/ssi/types"
import { REGISTRY_SECTION_OWN, REGISTRY_SECTION_PEER, REGISTRY_TYPE_IDENTITIES } from "./registry/types"
import { WalletWrapper } from "./types"


export const buildWalletLoader: (wallet: WalletWrapper) => LocalDocumentLoader
  = (wallet) => (didHelper, loaderBuilder, presentation, didDoc?) => async (url) => {
    const loader = loaderBuilder(() => {
      if (didHelper.isDIDId(url)) {
        const urlId = didHelper.parseDIDId(url).did

        const creds = [...presentation.verifiableCredential]
        const cred = creds.find(cred => cred.id === urlId)
        if (cred) {
          return cred
        }

        const iden = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
          .getCredential(urlId, REGISTRY_SECTION_PEER)
        if (iden && iden.credential) {
          return iden.credential
        }

        const me = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
          .getCredential(urlId, REGISTRY_SECTION_OWN)
        if (me && me.credential) {
          return me.credential
        }

        return didDoc
      }
    })

    return loader(url)
  }