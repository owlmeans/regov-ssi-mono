
import { CryptoKey } from 'metabelarusid-common'

export type DIDHelper = {
  createDID: (key: CryptoKey, options?: CreateDIDMethodOptions) => Promise<DIDDocumnet>
  makeDIDId: (key: CryptoKey, options?: MakeDIDIdOptions) => string
  makeDIDProofSignature: (key: CryptoKey, id: string, nonce: string, purposes: DIDDocumentPurpose[]) => string
  verifyDIDProofSignature: (did: DIDDocumnet, key?: CryptoKey) => boolean
}

export type DIDDocumnet = DIDDocumentPayload & {
  '@context': string | string[] | DIDDocumentContext | DIDDocumentContext[]
  id: string,
  controller?: string,
  proof: DIDDocumentProof,
  publicKey: {
    id: string, 
    type: string,
    publicKeyBase58: string,
  }[]
}

export type DIDDocumentPayload = {
  verificationMethod?: (string | DIDVerificationMethod)[]
  authenitcaion?: (string | DIDAuthentication)[]
  assertionMethod?: (string | DIDAssertion)[]
  keyAgreement?: (string | DIDKeyAgreement)[]
  capabilityInvocation?: (string | DIDCapability)[]
  capabilityDelegation?: (string | DIDDelegation)[]
  service?: DIDService[]
}

export type MakeDIDIdOptions = {
  data?: string
  expand?: boolean
  hash?: boolean
}

export type CreateDIDMethodOptions = MakeDIDIdOptions & {
  id?: string
  purpose?: DIDDocumentPurpose | DIDDocumentPurpose[]
}

export type DIDDocumentPurpose =
  typeof DIDPURPOSE_VERIFICATION
  | typeof DIDPURPOSE_AUTHENTICATION
  | typeof DIDPURPOSE_ASSERTION
  | typeof DIDPURPOSE_AGREEMENT
  | typeof DIDPURPOSE_CAPABILITY
  | typeof DIDPURPOSE_DELEGATION

export const DIDPURPOSE_VERIFICATION = 'verificationMethod'
export const DIDPURPOSE_AUTHENTICATION = 'authenitcaion'
export const DIDPURPOSE_ASSERTION = 'assertionMethod'
export const DIDPURPOSE_AGREEMENT = 'keyAgreement'
export const DIDPURPOSE_CAPABILITY = 'capabilityInvocation'
export const DIDPURPOSE_DELEGATION = 'capabilityDelegation'

export const didPurposeList = [
  DIDPURPOSE_VERIFICATION,
  DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_AGREEMENT,
  DIDPURPOSE_CAPABILITY,
  DIDPURPOSE_DELEGATION
]

export type DIDDocumentContext = {}

export type DIDVerificationItem = {
  id?: string
  type: string
  controller?: string
  publicKeyBase58: string
}

export type DIDVerificationMethod = DIDVerificationItem & {}

export type DIDAuthentication = DIDVerificationItem & {}

export type DIDAssertion = DIDVerificationItem & {}

export type DIDKeyAgreement = DIDVerificationItem & {}

export type DIDCapability = DIDVerificationItem & {}

export type DIDDelegation = DIDVerificationItem & {}

export type DIDService = {
  id: string,
  type: string,
  serviceEndpoint: DIDServiceEndpoint
}

export type DIDServiceEndpoint = string | { [key: string]: string } | string[]

export type DIDDocumentProof = {
  type: string,
  created: string,
  controller: string,
  nonce: string,
  signature: string
  verificationMethod?: string
}

export const DID_ERROR_NOVERIFICATION_METHOD = 'DID_ERROR_NOVERIFICATION_METHOD'

export const DEFAULT_DID_PREFIX = process.env.DID_PREFIX