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

import { DIDDocument, didPurposeList, DIDVerificationItem, normalizeValue } from "@owlmeans/regov-ssi-core"
import { JWTDecoded } from "did-jwt/lib/JWT"
import { Resolvable } from "did-resolver"


export const buildBasicResolver = (jwt: JWTDecoded): Resolvable => {
  return {
    resolve: async () => {
      const did: DIDDocument = JSON.parse(JSON.stringify(jwt.payload.sender))
      didPurposeList.forEach(
        purpose => {
          if (did[purpose]) {
            did[purpose] = normalizeValue(did[purpose]) as DIDVerificationItem[]
          }
        }
      )
      if (did.proof) {
        delete (did as any).proof
      }

      return {
        didResolutionMetadata: {},
        didDocumentMetadata: {},
        didDocument: did as any
      }
    }
  }
}