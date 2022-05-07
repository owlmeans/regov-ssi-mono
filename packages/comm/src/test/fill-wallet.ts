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
  DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION, DIDPURPOSE_VERIFICATION,
  REGISTRY_TYPE_IDENTITIES, VERIFICATION_KEY_HOLDER, WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { commDidHelperBuilder } from "../did"


export const fillWallet = async (wallet: WalletWrapper) => {
  const subject = {
    data: {
      '@type': 'TestCredentialSubjectDataType',
      worker: 'Valentin Michalych'
    }
  }
  const key = await wallet.ssi.keys.getCryptoKey()
  const didUnsigned = await wallet.ssi.did.helper().createDID(
    key,
    {
      data: JSON.stringify(subject),
      hash: true,
      purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
    }
  )

  const _didHelper = commDidHelperBuilder(wallet)

  const did = await wallet.ssi.did.helper().signDID(key, await _didHelper.addDIDAgreement(didUnsigned))

  const unsingnedCredentail = await wallet.ssi.buildCredential({
    id: did.id,
    type: ['VerifiableCredential', 'TestCredential'],
    holder: did,
    context: {
      '@version': 1.1,
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      exam: 'https://example.org/vc-schema#',
      data: {
        '@id': 'exam:data',
        '@type': '@id',
        '@context': {
          worker: { '@id': 'exam:worker', '@type': 'xsd:string' }
        }
      }
    },
    subject
  })

  const credentail = await wallet.ssi.signCredential(
    unsingnedCredentail, did, { keyId: VERIFICATION_KEY_HOLDER }
  )

  await wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).addCredential(credentail)
  wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).registry.rootCredential = credentail.id
}