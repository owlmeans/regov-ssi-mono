import { CrdentialType, Credential, CredentialSubject, IdType, UnsignedCredentail } from "credential/types"
import { KeyChain, KeyPair } from "keys/types"
import { SecureStore } from "store/types"

export type Wallet = {
  intialized: boolean

  alias: string

  safe: boolean

  keys: KeyChain

  identities: CredentialsRegistry

  credentials: CredentialsRegistry

  peerCredentials: CredentialsRegistry

  peerIdentities: CredentialsRegistry
}

export type CredentialsRegistry = {
  rootCredential?: string
  defaultSection: string
  credentials: { [section: string]: Credential[] }
}

export type WalletWrapper = {
  createCredential: CreateCredentialMethod

  signCredential: SignCredentialMethod

  addCredential: AddCredentialMethod

  addPeerCredential: AddCredentialMethod

  addIdentity: AddCredentialMethod

  addPeerIdentity: AddCredentialMethod
}

export type WalletContext = {
  store: SecureStore
}

export type MethodBuilder<Method extends Function> = (wallet: Wallet, context: WalletContext) => Method

export type WrapperBuilder = (alias: string, context: WalletContext) => WalletWrapper

/**
 * Helper to create self issued credential
 */
export type CreateCredentialMethod =
  <Subject extends CredentialSubject = CredentialSubject>(
    type: CrdentialType,
    subject: CredentialSubject[],
  ) => Promise<Credential<Subject>>

/**
 * Sign credentail with key and generate id for it
 * By default it creates IDTYPE_DETACHED id
 */
export type SignCredentialMethod =
  (
    credential: UnsignedCredentail,
    idType?: IdType,
    password?: string,
    key?: string | KeyPair | Credential
  ) => Promise<Credential>

export type AddCredentialMethod = (
  credential: Credential,
  section?: string
) => Promise<WalletWrapper>