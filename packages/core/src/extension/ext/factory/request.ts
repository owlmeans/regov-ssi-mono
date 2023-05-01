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

import { addToValue, normalizeValue, CryptoKey } from "../../../common"
import { isCredential } from "../../../vc"
import { DIDDocument, DIDDocumentUnsinged, VERIFICATION_KEY_HOLDER } from "../../../did"
import { RequestMethodBuilder, TYPE_REGOV_REQUEST } from "../types"
import { ERROR_FACTORY_NO_IDENTITY } from "./types"
import { Credential } from "../../../vc/types"


export const defaultRequestMethod: RequestMethodBuilder = schema =>
  async (wallet, params) => {
    const unsigneds = normalizeValue(params.unsignedRequest)
    const credentials: Credential[] = []

    let signerKey: CryptoKey = await wallet.keys.getCryptoKey()
    for (const unsigned of unsigneds) {
      const identity = params.identity || wallet.getIdentity()?.credential
      if (!identity) {
        throw ERROR_FACTORY_NO_IDENTITY
      }
      unsigned.evidence = addToValue(unsigned.evidence, identity)

      const unsignedDid = unsigned.holder as DIDDocumentUnsinged
      signerKey = await wallet.ssi.did.helper()
        .extractKey(unsignedDid, VERIFICATION_KEY_HOLDER) as CryptoKey
      if (!signerKey) {
        throw new Error('request.holder.key')
      }
      await wallet.ssi.keys.expandKey(signerKey)
      if (!signerKey.pk) {
        throw new Error('request.holder.pk')
      }
      const issuer = await wallet.ssi.did.helper().signDID(signerKey, unsignedDid)
      unsigned.holder = { id: issuer.id }
      /**
       * @TODO put proper request type to respective credential
       */
      if (schema.requestType && unsigneds.length > 1) {
        unsigned.type.push(schema.requestType)
      }

      credentials.push(
        await wallet.ssi.signCredential(unsigned, issuer, { keyId: VERIFICATION_KEY_HOLDER })
      )
    }
    let holder: DIDDocument | Credential = params.holder
      || (credentials[0].issuer as unknown as DIDDocument)

    if (isCredential(holder)) {
      if (typeof holder.issuer === 'string') {
        throw new Error('request.holder.format')
      }
      holder = holder.issuer as DIDDocument
    }

    if (!wallet.ssi.did.helper().isDIDDocument(holder)) {
      throw new Error('request.holder.format')
    }

    const helper = wallet.did.helper()

    const unsignedRequest = await wallet.ssi.buildPresentation(credentials, {
      holder, type: [...(schema.requestType != null ? [schema.requestType] : []), TYPE_REGOV_REQUEST] ,
      id: helper.parseDIDId(
        helper.makeDIDId(signerKey, { data: JSON.stringify(credentials), hash: true })
      ).did
    })

    return wallet.ssi.signPresentation(unsignedRequest, holder)
  }