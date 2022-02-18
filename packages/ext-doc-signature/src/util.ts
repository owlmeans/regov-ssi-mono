import { Presentation } from "@owlmeans/regov-ssi-core"
import { REGOV_SIGNATURE_REQUEST_TYPE } from "./types"


export const getSignatureRequestFromPresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(REGOV_SIGNATURE_REQUEST_TYPE)) {
    return undefined
  }

  return presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_SIGNATURE_REQUEST_TYPE)
  )
}