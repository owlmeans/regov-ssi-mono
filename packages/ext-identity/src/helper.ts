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

import {
  UnsignedCredential,
  Credential,
  WalletWrapper
} from "@owlmeans/regov-ssi-core"


export const credIdToIdentityId = (wallet: WalletWrapper, cred: UnsignedCredential | Credential) => {
  const id = wallet.did.helper().parseDIDId(cred.id).id
  const source = wallet.ssi.crypto.hash(id).substring(0, 24)
  
  return `${source.substring(0, 8)}-${source.substring(8, 16)}-${source.substring(16, 24)}`.toUpperCase()
}