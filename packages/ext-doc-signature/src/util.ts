import { MaybeArray, normalizeValue } from "@owlmeans/regov-ssi-core"
import { Presentation, Credential } from "@owlmeans/regov-ssi-core"
import {
  BASIC_IDENTITY_TYPE, REGOV_SIGNATURE_REQUEST_TYPE, REGOV_SIGNATURE_RESPONSE_TYPE,
  REGOV_CREDENTIAL_TYPE_SIGNATURE
} from "./types"


export const getSignatureRequestFromPresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(REGOV_SIGNATURE_REQUEST_TYPE)) {
    return undefined
  }

  return presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_SIGNATURE_REQUEST_TYPE)
  )
}

export const getSignatureResponseFromPresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(REGOV_SIGNATURE_RESPONSE_TYPE)) {
    return undefined
  }

  return presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_CREDENTIAL_TYPE_SIGNATURE)
  )
}

export const getSignatureRequestOwner = (crednetial: Credential) => {
  if (!crednetial.type.includes(REGOV_SIGNATURE_REQUEST_TYPE)) {
    return undefined
  }

  return normalizeValue<Credential>(crednetial.evidence as MaybeArray<Credential>).find(
    evidence => evidence?.type.includes(BASIC_IDENTITY_TYPE)
  )
}