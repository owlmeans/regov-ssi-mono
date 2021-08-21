import { DIDRegistryBundle, DIDRegistryWrapper } from "metabelarusid-did"
import { CryptoHelper } from "metabelarusid-common"
import { CommonContext } from "../credential/context/types"
import { CreateKeyOptions, KeyChain } from "../keys/types"
import { BasicStore, EncryptedStore, SecureStore } from "../store/types"
import { CredentialsRegistry, CredentialsRegistryWrapper, RegistryType } from './registry/types'


export type Wallet = {
  intialized?: boolean

  keyChain?: KeyChain

  registry?: DIDRegistryBundle

  identities?: CredentialsRegistry

  credentials?: CredentialsRegistry
}

export type WalletWrapperMethodBuilder<Method extends Function> = (wallet: Wallet, context: CommonContext) => Method

export type WalletWrapperBuilder = <Store extends BasicStore = BasicStore>(
  crypto: CryptoHelper,
  password: string,
  store?: Store | string,
  keyOptions?: CreateKeyOptions
) => Promise<WalletWrapper>

export type WalletWrapper = {
  store: SecureStore

  wallet: Wallet

  did: DIDRegistryWrapper

  ctx: CommonContext

  getRegistry: GetRegistryMethod

  export: (_password?: string) => Promise<EncryptedStore>
}

export type GetRegistryMethod = (type: RegistryType, peer?: boolean) => CredentialsRegistryWrapper

export const DEFAULT_WALLET_ALIAS = 'citizen'

