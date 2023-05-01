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

import { MaybeArray, normalizeValue } from "@owlmeans/regov-ssi-core"
import { Presentation, Credential } from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-core"
import {
  REGOV_CREDENTIAL_TYPE_GROUP, REGOV_CREDENTIAL_TYPE_MEMBERSHIP, REGOV_MEMBERSHIP_CLAIM_TYPE,
  BASIC_IDENTITY_TYPE, REGOV_MEMBERSHIP_OFFER_TYPE
} from "./types"


export const getGroupFromMembershipClaimPresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(REGOV_MEMBERSHIP_CLAIM_TYPE)) {
    return undefined
  }

  const membershipClaim = presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
  )

  return normalizeValue(membershipClaim?.evidence).find(
    evidence => evidence?.type.includes(REGOV_CREDENTIAL_TYPE_GROUP)
  ) as Credential
}

export const getGroupOwnerIdentity = (crednetial: Credential) => {
  if (!crednetial.type.includes(REGOV_CREDENTIAL_TYPE_GROUP)) {
    return undefined
  }

  return normalizeValue<Credential>(crednetial.evidence as MaybeArray<Credential>).find(
    evidence => evidence?.type.includes(BASIC_IDENTITY_TYPE)
      && evidence.id === (crednetial.issuer as unknown as DIDDocument).id
  )
}

export const getMembershipClaimHolder = (presentation: Presentation) => {
  const membership = presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
  )

  return membership?.issuer as unknown as DIDDocument
}

export const getMembershipClaim = (presentation: Presentation) => {
  return presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
  )
}

export const getGroupFromMembershipOfferPresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(REGOV_MEMBERSHIP_OFFER_TYPE)) {
    return undefined
  }

  const membershipClaim = presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
  )

  return normalizeValue(membershipClaim?.evidence).find(
    evidence => evidence?.type.includes(REGOV_CREDENTIAL_TYPE_GROUP)
  ) as Credential
}

export const getMembershipOffer = (presentation: Presentation) => {
  return presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_CREDENTIAL_TYPE_MEMBERSHIP)
  )
}