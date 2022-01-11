
import { CryptoKey, MaybeArray, Idish } from '@owlmeans/regov-ssi-common'

export type DIDHelper = {
  makeDIDId: (key: CryptoKey, options?: MakeDIDIdOptions) => string
  isDIDId: (id: string) => boolean
  parseDIDId: ParseDIDIdMethod

  extractProofController: (did: DIDDocument, keyId?: string) => string
  expandVerificationMethod: ExpandVerificationMethod

  createDID: (key: CryptoKey, options?: CreateDIDMethodOptions, schema?: string) => Promise<DIDDocumentUnsinged>
  signDID: (
    key: CryptoKey,
    didDocUnsigned: DIDDocumentUnsinged | DIDDocument,
    keyId?: SignDID_KeyId,
    purposes?: DIDDocumentPurpose[]
  ) => Promise<DIDDocument>
  delegate: (
    key: CryptoKey,
    source: DIDDocument,
    delegatee: string,
    purposes?: DIDDocumentPurpose[]
  ) => Promise<DIDDocument>
  verifyDID: (did: DIDDocument) => Promise<boolean>

  isDIDDocument: (obj: Object) => obj is DIDDocument

  isDIDUnsigned: (obj: Object) => obj is DIDDocumentUnsinged

  didToLongForm: (did: DIDDocument) => Promise<string>
  extractKey: ExtractKeyMethod
  extractKeyId: (key: string) => string
  setupDocumentLoader: (loader: BuildDocumentLoader) => void
}

export type ExtractKeyMethod = (did: DIDDocument | DIDDocumentUnsinged | string , keyId?: string) => Promise<CryptoKey | undefined>

export type ExpandVerificationMethod = (didDoc: DIDDocument, purpose: DIDDocumentPurpose, keyId?: string) =>
  DIDVerificationItem | never


export const VERIFICATION_KEY_HOLDER = 'holder'
export const VERIFICATION_KEY_CONTROLLER = 'controller'
export const VERIFICATION_KEY_DELEGATEE = 'delegatee'

export const DEFAULT_VERIFICATION_KEY = VERIFICATION_KEY_HOLDER

export type SignDID_KeyId = typeof VERIFICATION_KEY_HOLDER
  | typeof VERIFICATION_KEY_CONTROLLER
  | typeof VERIFICATION_KEY_DELEGATEE


export type ParseDIDIdMethod = (id: Idish) => DIDIDExplained

export type DIDIDExplained = {
  method: string
  id: string
  subjectId?: string
  fragment?: string
  query?: QueryDict
  did: string
  purpose?: string
  keyIdx?: number
}

export type QueryDict = { [key: string]: string | string[] | undefined }

export type DIDDocument = DIDDocumentUnsinged & {
  proof: DIDDocumentProof
}

export type DIDDocumentUnsinged = DIDDocumentPayload & {
  '@context': MaybeArray<string | DIDDocumentContext>
  id: string
  service?: MaybeArray<DIDService>
  alsoKnownAs?: MaybeArray<string>
  controller?: string
}

export type DIDDocumentPayload = {
  verificationMethod?: MaybeArray<DIDVerificationMethod>
  authentication?: MaybeArray<string | DIDAuthentication>
  assertionMethod?: MaybeArray<string | DIDAssertion>
  keyAgreement?: MaybeArray<string | DIDKeyAgreement>
  capabilityInvocation?: MaybeArray<string | DIDCapability>
  capabilityDelegation?: MaybeArray<string | DIDDelegation>
}

export type BuildDIDHelperOptions = {
  prefix?: string
  schemaPath?: string
}

export type MakeDIDIdOptions = {
  data?: string
  expand?: boolean
  hash?: boolean
  query?: QueryDict
}

export type CreateDIDMethodOptions = MakeDIDIdOptions & {
  id?: string
  purpose?: MaybeArray<DIDDocumentPurpose>
  alsoKnownAs?: MaybeArray<string>,
  source?: DIDDocument | DIDDocumentUnsinged,
  keyId?: SignDID_KeyId
}

export type DIDDocumentPurpose =
  typeof DIDPURPOSE_VERIFICATION
  | typeof DIDPURPOSE_AUTHENTICATION
  | typeof DIDPURPOSE_ASSERTION
  | typeof DIDPURPOSE_AGREEMENT
  | typeof DIDPURPOSE_CAPABILITY
  | typeof DIDPURPOSE_DELEGATION

export type DIDDocumentSimplePurpose =
  typeof DIDPURPOSE_AUTHENTICATION
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
  '@context'?: any
  id: string
  type: string
  controller: string
  nonce?: string
  publicKeyBase58?: string
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

export type BuildDocumentLoader<Type extends {} = {}> =
  (fallback?: () => DIDDocument | DIDDocumentUnsinged | undefined) =>
    (url: string) => Promise<LoadedDocument<Type>>

export type LoadedDocument<Type extends {} = {}> = {
  contextUrl: string | null
  document: DIDDocument | Type,
  documentUrl: string,
}

export const DID_ERROR_NOVERIFICATION_METHOD = 'DID_ERROR_NOVERIFICATION_METHOD'
export const DID_ERROR_VERIFICATION_METHOD_AMBIGUOUS = 'DID_ERROR_VERIFICATION_METHOD_AMBIGUOUS'

export const DID_ERROR_VERIFICATION_METHOD_LOOKUP = 'DID_ERROR_VERIFICATION_METHOD_LOOKUP'
export const DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD = 'DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD'

export const DID_EXTRACTKEY_WRONG_DID = 'DID_EXTRACTKEY_WRONG_DID'

export const DEFAULT_APP_SCHEMA_URL = process.env.APP_SCHEMA_URL

export const DEFAULT_DID_PREFIX = process.env.DID_PREFIX
export const DEFAULT_DID_SCHEMA_PATH = process.env.DID_SCHEMA_PATH