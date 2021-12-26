import { 
  BASE_CREDENTIAL_TYPE, 
  BASE_PRESENTATION_TYPE 
} from "@owlmeans/regov-ssi-core"

export const LIBREACT_HOLDER_ISNT_UNSIGNEDID = 'LIBREACT_HOLDER_ISNT_UNSIGNEDID'

export type VerificationResult = PresentationVerificationResult | CredentialVerificationResult | UnknownVerificationResult

export type PresentationVerificationResult = BaseVerificationResult & {
  type: typeof BASE_PRESENTATION_TYPE
  purpose?: string
  credentials: CredentialVerificationResult[]
}

export type CredentialVerificationResult = BaseVerificationResult & {
  type: typeof BASE_CREDENTIAL_TYPE
  hasEvidence: boolean
  hasSchema: boolean
  selfSigned: boolean
}

export type UnknownVerificationResult = {
  type: 'unknown'
}

export type BaseVerificationResult = {
  valid: boolean
  extension?: string
}