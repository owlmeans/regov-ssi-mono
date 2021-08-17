import { CredentialType, Credential, CredentialSubject, UnsignedCredentail, CreateCredentialMethod, SignCredentialMethod } from "credential/types"
import { KeyChain, KeyPair } from "keys/types"
import { SecureStore } from "store/types"
import { CredentialsRegistry, CredentialsRegistryWrapper, RegistryType } from "./registry/types"


export type WalletContext = {
  store: SecureStore
}

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

export type WalletWrapperMethodBuilder<Method extends Function> = (wallet: Wallet, context: WalletContext) => Method

export type WalletWrapperBuilder = (alias: string, context: WalletContext) => WalletWrapper

export type WalletWrapper = {
  createCredential: CreateCredentialMethod

  signCredential: SignCredentialMethod

  getRegistry: GetRegistryMethod
}

export type GetRegistryMethod = (type: RegistryType, peer?: boolean) => CredentialsRegistryWrapper




