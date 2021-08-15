import {
  MaybeArray, SimpleThing, TContext,
  VCV1, VCV1Proof, VCV1Skeleton, VCV1Subject,
  VCV1SubjectMA, VCV1Type, VPV1
} from "@affinidi/vc-common"
import {
  Crypto,
  EntityKey,
  KeyChain,
  KeyChainClaim,
  KeyPair
} from "cryptowrapper/types"


export const BASICWALLET_CREDENTIALS = 'credentials'
export const BASICWALLET_KEYS = 'keys'
export const BASICWALLET_IDENTITY = 'identity'

export const IDTYPE_SUBJECT = 'subject'
export const IDTYPE_SUBJECTS = 'subjects'

export const CREDENTIALS_TYPE_KEY_PERMISSION = 'credentials:typekey:permission'

export const ERROR_WALLET_EXISTS = 'ERROR_WALLET_EXISTS'
export const ERROR_IDENTITY_EXISTS = 'ERROR_IDENTITY_EXISTS'
export const ERROR_NO_STORE_PASSWORD = 'ERROR_NO_STORE_PASSWORD'


export type BasicWalletType = 'credentials' | 'keys' | 'identity' | string
export type IdType = 'subject' | 'subjects'

export type Store = {
  exists: (type: BasicWalletType, alias: string) => Promise<boolean>
  extract: <EntityType extends WalletEntity>(type: BasicWalletType, alias: string, password: string)
    => Promise<BasicWallet<EntityType>>
  store: <EntityType extends WalletEntity>(type: BasicWalletType, wallet: BasicWallet<EntityType>, alias: string, password: string) => Promise<void>
  forget: <EntityType extends WalletEntity>(type: BasicWalletType, alias: string) => Promise<BasicWallet<EntityType>>
}

export type WalletContext = {
  didPrefix: string,
  identityDidPrefix: string,
  personDidPrefix: string,
  organizationDidPrefix: string,
  credentialsDidPrefix: string,
  permissionsDidPrefix: string,
  crypto: Crypto
  getCredentialsType: (key: string) => string
  produceIdentity: (entityKey: EntityKey) => Promise<IdentityEntity>
  getDefaultCredentialsContext: () => TContext
  produceDepersonalizedId: (type: IdType, data: Object, prefixId?: string) => Promise<string>
  producePresentation: (wallet: Wallet, resulsts: CredentialsSearchResult[], holder?: Identity) => Promise<VPV1>
  subjectCompare: <Data extends SimpleThing>(left: VCV1Subject<Data>, right: VCV1Subject<Data>) => Promise<boolean>
}

export type Wallet = {
  exists: boolean

  alias: string

  password?: string

  store: Store

  identity: IdentityWallet

  keys: KeysWallet

  credentials: CredentialsWallet
}

export type CredentialsSearchResult = {
  request: CredentialsRequest,
  results: CredentialsEntity[]
}

export type BasicWalletWrapper = {
  create: (claim?: KeyChainClaim) => Promise<BasicWalletWrapper>
  open: (password: string, safe?: boolean) => Promise<BasicWalletWrapper>
  save: (password?: string) => Promise<void>
  close: () => Promise<BasicWalletWrapper>
  forget: () => Promise<void>
  getOperator: () => WalletOpertor
  getHolder: () => HolderWalletOperator
  getIssuer: () => IssuerWalletOperator
  getVerifier: () => VerifierWalletOperator
} & Wallet

export type WalletOpertor = {
  getSubjectsId: <Data extends SimpleThing>(
    subjects: SubjectClaim<Data>[],
    type: VCV1Type,
    holder: Identity
  ) => Promise<string>
  getSubjectId: <Data extends SimpleThing>(
    subject: SubjectClaim<Data>
  ) => Promise<string>
}

export type HolderWalletOperator = {
  createCredentialsClaim: <Data extends SimpleThing>(
    subjectClaims: SubjectClaim<Data>[],
    type: VCV1Type,
    issuer: Identity,
    holder?: Identity
  ) => Promise<CredentialsClaim<Data>>
  createPresentation: (request: PersentationRequest, holder?: Identity) => Promise<VPV1>
  addCredentails: (credentials: CredentialsEntity, alias?: string, claim?: CredentialsClaim) => Promise<void>
}

export type IssuerWalletOperator = {
  issueCredentials: (credentialsClaim: CredentialsClaim, issuer?: Issuer) => Promise<VCV1>
  requestCredentialsClaim: <Data extends SimpleThing>(
    subjectClaims: SubjectClaim<Data>[],
    types: VCV1Type[],
    holder: Identity,
    issuer?: Identity
  ) => Promise<CredentialsClaimRequest<Data>>
}

export type VerifierWalletOperator = {
  requestCredentials: (
    requests: PersentationRequest[],
    holder?: Identity,
    verifier?: Identity
  ) => Promise<PersentationRequest>
  verifyCredentials: (credentials: VCV1, holder?: Identity) => Promise<void>
  verifyPresentation: (presentation: VPV1, request?: PersentationRequest) => Promise<CredentialsVerificationResult[]>
}

export type CredentialsEntity<
  T extends SimpleThing = SimpleThing,
  Subject extends MaybeArray<VCV1Subject<T>> = VCV1SubjectMA<T>
  > = {} & VCV1<Subject>

export type IdentitySubject = SimpleThing & Identity & {}

export type IdentityEntity = {} & CredentialsEntity<IdentitySubject>

export type WalletEntity = KeyPair | CredentialsEntity | IdentityEntity

export type BasicWallet<EntityType extends WalletEntity> = {
  didIndex: { [k: string]: EntityType },
  aliasIndex: { [k: string]: string[] },
  typeSpecificData?: any
}

export type IdentityWallet = {
  identity: IdentityEntity
} & BasicWallet<IdentityEntity>

export type CredentialsWallet = {
  permissions: string[]
  credentials: string[]
} & BasicWallet<CredentialsEntity>

export type KeysWallet = {
  keyChain: KeyChain
} & BasicWallet<KeyPair>

export type Issuer = {
  key: KeyPair
} & Identity

export type SubjectClaim<Data extends SimpleThing> = VCV1Subject<Data>

export type CredentialsClaim<Data extends SimpleThing = SimpleThing> = {
  issuer?: Identity
  claim: VCV1Skeleton<MaybeArray<VCV1Subject<Data>>>
}

export type CredentialsClaimRequest<Data extends SimpleThing> = {
  holder: Identity
  type: VCV1Type,
  subjectClaims: SubjectClaim<Data>[],
  issuer: Identity
}

export type PersentationRequest = {
  verifier: Identity,
  holder?: Identity,
  requests: CredentialsRequest[],
  proof?: VCV1Proof
}

export type CredentialsRequest = {
  issuer?: Identity[],
  type: VCV1Type
}

export type CredentialsVerificationResult = {
  request: CredentialsRequest,
  result: boolean
}

export type Identity = { id: string }

export type createStore = () => Store