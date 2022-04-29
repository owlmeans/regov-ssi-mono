import { Credential, Presentation } from "@owlmeans/regov-ssi-core";
import { AuthSubject, REGOV_AUTH_RESPONSE_TYPE, REGOV_CREDENTIAL_TYPE_AUTH } from "./types";



export const getAuthFromPresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(REGOV_AUTH_RESPONSE_TYPE)) {
    return undefined
  }

  return presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_CREDENTIAL_TYPE_AUTH)
  )
}

export const getAuthSubject = (cred: Credential): AuthSubject => {
  return cred.credentialSubject as unknown as AuthSubject
}

export const pinValidation = {
  required: true,
  minLength: 4,
  pattern: /^\d+$/
}