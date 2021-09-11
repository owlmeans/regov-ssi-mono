
import { CommonCryptoKey } from '@owlmeans/regov-ssi-common'

export type DIDHelper = {
  makeDIDId: (key: CommonCryptoKey, options?: MakeDIDIdOptions) => string
  isDIDId: (id: string) => boolean
  parseDIDId: ParseDIDIdMethod

  extractProofController: (did: DIDDocument) => string  
  expandVerificationMethod: ExpandVerificationMethod

  createDID: (key: CommonCryptoKey, options?: CreateDIDMethodOptions) => Promise<DIDDocumentUnsinged>
  signDID: (
    key: CommonCryptoKey, 
    didDocUnsigned: DIDDocumentUnsinged, 
    keyId?: SignDID_KeyId,
    purposes?: DIDDocumentPurpose[]
  ) => Promise<DIDDocument>
  verifyDID: (did: DIDDocument) => Promise<boolean>
  
  didToLongForm: (did: DIDDocument) => Promise<string>
  extractKey: ExtractKeyMethod
  extractKeyId: (key: string) => string
  setupDocumentLoader: (loader: BuildDocumentLoader) => void
}

export type ExtractKeyMethod = (did: DIDDocument | string, keyId?: string) => Promise<CommonCryptoKey | undefined>

export type ExpandVerificationMethod = (didDoc: DIDDocument, purpose: DIDDocumentPurpose, keyId?: string) =>
  DIDVerificationItem | never


export const VERIFICATION_KEY_HOLDER = 'holder'
export const VERIFICATION_KEY_CONTROLLER = 'controller'

export const DEFAULT_VERIFICATION_KEY = VERIFICATION_KEY_HOLDER

export type SignDID_KeyId = typeof VERIFICATION_KEY_HOLDER | typeof VERIFICATION_KEY_CONTROLLER


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
  verificationMethod?: (DIDVerificationMethod)[]
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

export const PUBLICKEY_VERIFICATION = 'publicKey'
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
  '@context'?: any
  id: string
  type: string
  controller: string
  nonce?: string
  publicKeyBase58?: string
  originalPurposes?: DIDDocumentPurpose[]
  proof?: DIDDocumentProof
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
  proofPurpose?: DIDDocumentPurpose,
  jws: string
  verificationMethod: string
}

export type BuildDocumentLoader =
  (fallback?: () => DIDDocument | DIDDocumentUnsinged | undefined) =>
    (url: string) => Promise<any>

export const DID_ERROR_NOVERIFICATION_METHOD = 'DID_ERROR_NOVERIFICATION_METHOD'
export const DID_ERROR_VERIFICATION_METHOD_AMBIGUOUS = 'DID_ERROR_VERIFICATION_METHOD_AMBIGUOUS'

export const DID_ERROR_VERIFICATION_METHOD_LOOKUP = 'DID_ERROR_VERIFICATION_METHOD_LOOKUP'
export const DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD = 'DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD'

export const DID_EXTRACTKEY_WRONG_DID = 'DID_EXTRACTKEY_WRONG_DID'

export const DEFAULT_DID_PREFIX = process.env.DID_PREFIX