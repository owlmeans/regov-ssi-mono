/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { DIDRegistryBundle, DIDRegistryWrapper } from "../did"
import { CryptoHelper } from "../common"
import { SSICore, Credential } from "../vc"
import { CreateKeyOptions, KeyChain, KeyChainWrapper } from "../keys/types"
import { BasicStore, EncryptedStore, SecureStore } from "../store/types"
import {
  CredentialsRegistry, CredentialsRegistryWrapper, CredentialWrapper, RegistryItem, RegistryType
} from './registry/types'
import { ExtensionRegistry } from "../extension"


export type Wallet = {
  intialized?: boolean

  keyChain?: KeyChain

  registry?: DIDRegistryBundle

  identities?: CredentialsRegistry

  credentials?: CredentialsRegistry
}

export type WalletWrapperMethodBuilder<Method extends Function> = (wallet: Wallet, context: SSICore) => Method

export type WalletWrapperBuilder = <Store extends BasicStore = BasicStore>(
  dependencies: { 
    crypto: CryptoHelper
    extensions?: ExtensionRegistry
  },
  password: string,
  store?: Store | string,
  options?: WalletOptions
) => Promise<WalletWrapper>

export type WalletOptions = {
  prefix?: string,
  defaultSchema?: string,
  didSchemaPath?: string
  key?: CreateKeyOptions
}

export type WalletWrapper = {
  crypto: CryptoHelper

  store: SecureStore

  wallet: Wallet

  did: DIDRegistryWrapper

  keys: KeyChainWrapper

  ssi: SSICore

  hasIdentity: () => boolean

  getIdentity: <
    Subject extends {} = {},
    Identity extends Credential<Subject> = Credential<Subject>
    >() => CredentialWrapper<Subject, Identity> | undefined

  getRegistry: GetRegistryMethod

  findCredential: (id: string, section?: string) => CredentialWrapper | undefined

  export: (_password?: string) => Promise<EncryptedStore>

  getConfig: () => WalletOptions
}

export type GetRegistryMethod = (type?: RegistryType) => CredentialsRegistryWrapper

export const DEFAULT_WALLET_ALIAS = 'citizen'

export const ERROR_NO_IDENTITY = 'ERROR_NO_IDENTITY'