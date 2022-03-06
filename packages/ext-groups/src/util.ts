import { MaybeArray, normalizeValue } from "@owlmeans/regov-ssi-core"
import { Presentation, Credential } from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-core"
import {
  REGOV_CREDENTIAL_TYPE_GROUP,
  REGOV_CREDENTIAL_TYPE_MEMBERSHIP,
  REGOV_CLAIM_TYPE,
  BASIC_IDENTITY_TYPE,
  REGOV_OFFER_TYPE
} from "./types"


export const getGroupFromMembershipClaimPresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(REGOV_CLAIM_TYPE)) {
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
  if (!presentation.type.includes(REGOV_OFFER_TYPE)) {
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