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

import { DIDDocument, DIDDocumentUnsinged, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION, VERIFICATION_KEY_CONTROLLER } from "../../../did"
import { Credential } from '../../../vc'
import { buildWalletLoader } from '../../../wallet/loader'
import { updateDidIdWithKey } from "../../schema"
import { RefuseMethodBuilder, TYPE_REGOV_REFUSE } from "../types"


export const defaultRefuseMethod: RefuseMethodBuilder = schema => async (wallet, params) => {
  const {
    claim, credential, holder, subject, cryptoKey, claimType, refuseType, id, challenge, domain
  }: typeof params = {
    ...params, ...(!params.claimType && schema.claimType ? { claimType: schema.claimType } : {}),
    ...(!params.refuseType && schema.refuseType ? { refuseType: schema.refuseType } : {})
  }

  const [isValid, result] = await wallet.ssi.verifyPresentation(claim, undefined, {
    testEvidence: true, nonStrictEvidence: true, localLoader: buildWalletLoader(wallet)
  })

  if (!isValid) {
    console.error(result)
    throw 'claim.invalid'
  }

  const refusedCredential = JSON.parse(JSON.stringify(credential)) as Credential
  refusedCredential.credentialSubject = subject as any
  let issuerDid: DIDDocument | DIDDocumentUnsinged = JSON.parse(JSON.stringify(holder))
  delete (issuerDid as any).proof
  updateDidIdWithKey(wallet.did.helper(), schema, cryptoKey, issuerDid, refusedCredential)
  issuerDid = await wallet.did.helper().signDID(
    cryptoKey, issuerDid, VERIFICATION_KEY_CONTROLLER,
    [DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
  )
  delete (refusedCredential as any).proof
  if (claimType) {
    const idx = refusedCredential.type.findIndex(type => type === claimType)
    refusedCredential.type.splice(idx, 1)
    if (refuseType != null) {
      refusedCredential.type.push(refuseType)
    }
  }
  refusedCredential.holder = holder

  const signed = await wallet.ssi.signCredential(refusedCredential, issuerDid as DIDDocument)
  const refuse = await wallet.ssi.buildPresentation([signed], { 
    holder: issuerDid, type: [...(refuseType != null ? [refuseType] : []), TYPE_REGOV_REFUSE] , id 
  })

  return wallet.ssi.signPresentation(refuse, issuerDid as DIDDocument, { challenge, domain })
}
