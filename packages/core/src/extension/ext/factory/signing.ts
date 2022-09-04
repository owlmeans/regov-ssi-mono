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

import { addToValue, CryptoKey, normalizeValue } from "../../../common"
import { isCredential } from "../../../vc"
import {
  DIDDocument, DIDDocumentUnsinged, VERIFICATION_KEY_CONTROLLER, VERIFICATION_KEY_HOLDER
} from "../../../did"
import { SignMethodBuilder } from "../types"
import { ERROR_FACTORY_EVIDENCE_HOLDER_FORMAT, ERROR_FACTORY_SIGNING_KEY_ISNT_RETRIVED, EVENT_EXTENSION_BEFORE_SIGNING_DID, ExtensionEventBeforeSigningDid } from "./types"


export const defaultSignMethod: SignMethodBuilder = schema =>
  async (wallet, params) => {
    const unsigned = params.unsigned
    const unsignedDid = unsigned.holder as DIDDocumentUnsinged
    let issuer: DIDDocument | undefined = undefined

    if (params.evidence) {
      let signerKey: CryptoKey | undefined = undefined
      await Promise.all(normalizeValue(params.evidence).map(async evidence => {
        if (!isCredential(evidence)) {
          throw ERROR_FACTORY_EVIDENCE_HOLDER_FORMAT
        }

        const signer = wallet.did.helper().isDIDDocument(evidence.holder)
          ? evidence.holder as DIDDocument
          : evidence.issuer

        if (!wallet.did.helper().isDIDDocument(signer)) {
          return
        }

        if (!normalizeValue(unsigned.evidence).find(evidence => evidence?.id === evidence?.id)) {
          unsigned.evidence = addToValue(unsigned.evidence, evidence)
        }

        const evidenceInfo = normalizeValue(schema.evidence).find(
          _evidence => _evidence && evidence.type.includes(_evidence.type)
        )
        if (evidenceInfo?.signing) {
          signerKey = await wallet.ssi.did.helper().extractKey(signer, VERIFICATION_KEY_HOLDER)
          if (!signerKey) {
            throw new Error('evidence.holder.key')
          }
          await wallet.ssi.keys.expandKey(signerKey)
          if (!signerKey.pk) {
            throw new Error('evidence.holder.pk')
          }
          if (!signer || typeof signer === 'string') {
            throw new Error('evidence.signer.type')
          }
          issuer = signer
        }
      }))
      if (!signerKey) {
        throw ERROR_FACTORY_SIGNING_KEY_ISNT_RETRIVED
      }
      await params.extensions?.triggerEvent<ExtensionEventBeforeSigningDid>(
        wallet, EVENT_EXTENSION_BEFORE_SIGNING_DID, {
        unsigned: unsignedDid,
        cred: unsigned,
        key: signerKey
      })
      unsigned.holder = await wallet.ssi.did.helper().signDID(
        signerKey, unsignedDid, VERIFICATION_KEY_CONTROLLER
      )
    } else {
      const signerKey = await wallet.ssi.did.helper().extractKey(unsignedDid, VERIFICATION_KEY_HOLDER)
      if (!signerKey) {
        throw new Error('evidence.holder.key')
      }
      await wallet.ssi.keys.expandKey(signerKey)
      if (!signerKey.pk) {
        throw new Error('evidence.holder.pk')
      }
      await params.extensions?.triggerEvent<ExtensionEventBeforeSigningDid>(
        wallet, EVENT_EXTENSION_BEFORE_SIGNING_DID, {
        unsigned: unsignedDid,
        cred: unsigned,
        key: signerKey
      })
      issuer = await wallet.ssi.did.helper().signDID(signerKey, unsignedDid)
      unsigned.holder = { id: issuer.id }
    }

    return await wallet.ssi.signCredential(unsigned, issuer, { keyId: VERIFICATION_KEY_HOLDER })
  }