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

import {
  DIDPURPOSE_VERIFICATION, DIDVerificationItem, KEYCHAIN_ERROR_NO_KEY, VERIFICATION_KEY_HOLDER,
  WalletWrapper, CryptoKey, DIDDocumentUnsinged, DIDPURPOSE_AGREEMENT
} from "@owlmeans/regov-ssi-core"
import { COMM_DID_AGREEMENT_KEY_DEFAULT, COMM_VERIFICATION_TYPE } from './types'
import { cryptoKeyToCommKey } from "./util"


export const commDidHelperBuilder = (wallet: WalletWrapper) => {
  const _helper = {
    extractCommKey: async (did: DIDDocumentUnsinged, keyId: string = COMM_DID_AGREEMENT_KEY_DEFAULT) => {
      const cryptoKey = await wallet.did.extractKey(did, VERIFICATION_KEY_HOLDER)
      if (!cryptoKey) {
        throw new Error(KEYCHAIN_ERROR_NO_KEY)
      }
      await wallet.keys.expandKey(cryptoKey)
      
      return await cryptoKeyToCommKey(cryptoKey)
    },

    addDIDAgreement: async (
      did: DIDDocumentUnsinged, key?: CryptoKey | string, keyId: string = COMM_DID_AGREEMENT_KEY_DEFAULT
    ) => {
      const helper = wallet.did.helper()
      const holderVerificationMethod = helper.expandVerificationMethod(
        did, DIDPURPOSE_VERIFICATION, VERIFICATION_KEY_HOLDER
      )

      const cryptoKey = key
        ? typeof key === 'string'
          ? await wallet.keys.getCryptoKey(key)
          : key
        : await wallet.did.extractKey(did, VERIFICATION_KEY_HOLDER)
      if (!cryptoKey) {
        throw new Error(KEYCHAIN_ERROR_NO_KEY)
      }
      await wallet.keys.expandKey(cryptoKey)
      const commKey = await cryptoKeyToCommKey(cryptoKey)

      // https://w3id.org/security/suites/x25519-2020/v1
      const agreementVerficationMethod: DIDVerificationItem = {
        id: `${did.id}#${keyId}`,
        type: COMM_VERIFICATION_TYPE,
        controller: holderVerificationMethod.controller,
        publicKeyBase58: helper.getCrypto().base58().encode(commKey.pubKey)
      }

      return helper.addPurpose(did, DIDPURPOSE_AGREEMENT, agreementVerficationMethod)
    }
  }

  return _helper
}