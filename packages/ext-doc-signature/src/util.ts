import { MaybeArray, normalizeValue } from "@owlmeans/regov-ssi-common"
import { Presentation, Credential } from "@owlmeans/regov-ssi-core"
import { BASIC_IDENTITY_TYPE, REGOV_SIGNATURE_REQUEST_TYPE } from "./types"


export const getSignatureRequestFromPresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(REGOV_SIGNATURE_REQUEST_TYPE)) {
    return undefined
  }

  return presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_SIGNATURE_REQUEST_TYPE)
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