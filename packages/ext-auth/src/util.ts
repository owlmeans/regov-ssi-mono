import { Presentation } from "@owlmeans/regov-ssi-core";
import { REGOV_AUTH_RESPONSE_TYPE, REGOV_CREDENTIAL_TYPE_AUTH } from "./types";



export const getAuthFromResponsePresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(REGOV_AUTH_RESPONSE_TYPE)) {
    return undefined
  }

  return presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_CREDENTIAL_TYPE_AUTH)
  )
}