
import { CommonCryptoKey } from '@owlmeans/regov-ssi-common'

export type DIDHelper = {
  createDID: (key: CommonCryptoKey, options?: CreateDIDMethodOptions) => Promise<DIDDocumentUnsinged>
  signDID: (key: CommonCryptoKey, didDocUnsigned: DIDDocumentUnsinged, purposes?: DIDDocumentPurpose[]) => Promise<DIDDocument>
  makeDIDId: (key: CommonCryptoKey, options?: MakeDIDIdOptions) => string
  didToLongForm: (did: DIDDocument) => Promise<string>
  extractProofController: (did: DIDDocument) => string
  verifyDID: (did: DIDDocument, key?: CommonCryptoKey) => Promise<boolean>
  parseDIDId: ParseDIDIdMethod
  isDIDId: (id: string) => boolean
  expandVerificationMethod: (didDoc: DIDDocument, method: string) => DIDVerificationItem | undefined
  setupDocumentLoader: (loader: BuildDocumentLoader) => void
}

export type ParseDIDIdMethod = (id: string) => DIDIDExplained

export type DIDIDExplained = {
  method: string
  id: string,
  subjectId?: string,
  fragment?: string
  query?: string
  did: string
  purpose?: string
  keyIdx?: number
}

export type DIDDocument = DIDDocumentUnsinged & {
  proof: DIDDocumentProof
}

export type DIDDocumentUnsinged = DIDDocumentPayload & {
  '@context': string | string[] | DIDDocumentContext | DIDDocumentContext[]
  id: string
  controller?: string
  publicKey: {
    id: string,
    type: string,
    publicKeyBase58: string,
  }[]
}

export type DIDDocumentPayload = {
  verificationMethod?: (string | DIDVerificationMethod)[]
  authentication?: (string | DIDAuthentication)[]
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
export const DIDPURPOSE_AUTHENTICATION = 'authentication'
export const DIDPURPOSE_ASSERTION = 'assertionMethod'
export const DIDPURPOSE_AGREEMENT = 'keyAgreement'
export const DIDPURPOSE_CAPABILITY = 'capabilityInvocation'
export const DIDPURPOSE_DELEGATION = 'capabilityDelegation'

export const didPurposeList: DIDDocumentPurpose[] = [
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
  originalPurposes?: DIDDocumentPurpose[]
  nonce?: string
  publicKeyBase58: string
  proof?: DIDDocumentProof
  '@context'?: any
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
  proofPurpose?: string,
  jws: string
  verificationMethod?: string
}

export type BuildDocumentLoader =
  (fallback?: () => DIDDocument | DIDDocumentUnsinged | undefined) =>
    (url: string) => Promise<any>

export const DID_ERROR_NOVERIFICATION_METHOD = 'DID_ERROR_NOVERIFICATION_METHOD'
export const DID_ERROR_VERIFICATION_METHOD_AMBIGUOUS = 'DID_ERROR_VERIFICATION_METHOD_AMBIGUOUS'
export const DID_ERROR_VERIFICATION_METHOD_LOOKUP = 'DID_ERROR_VERIFICATION_METHOD_LOOKUP'
export const DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD = 'DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD'

export const DEFAULT_DID_PREFIX = process.env.DID_PREFIX