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

import { CryptoKey, CryptoHelper } from "../common"


export type KeyChain = {
  defaultKey: string
  keys: { [key: string]: KeyPair }
}

export type KeyChainWrapper = {
  keys: KeyChain,

  getDefaultPassword: () => string

  openKey: (keypair: KeyPair, password?: string, rotation?: number) => Promise<KeyRotation>

  createKey: (alias: string, password?: string, options?: CreateKeyOptions) => Promise<KeyPair>

  getCryptoKey: (key?: KeyPair | string, _password?: string, options?: KeyPairToCryptoKeyOptions) => Promise<CryptoKey>
  
  expandKey: (key: CryptoKey, _password?: string) => Promise<void>
}

export type BuildKeyChainWrapperMethod =
  (options: {
    crypto: CryptoHelper,
    password: string,
    source?: KeyChain,
    keyOptions?: CreateKeyOptions
  }) => Promise<KeyChainWrapper>

export type KeyPair = {
  alias: string
  currentRotation: number
  rotations: KeyRotation[]
  type: string
  safe: boolean
  dp: DPArgs
  id: string
  seed: string
  safeComment?: string
}

export type KeyRotation = {
  seed?: string,
  private: string
  public: string
  opened: boolean
  type: string
  nextDigest?: string
  digest: string
  safe: boolean
  dp: DPArgs
  safeComment?: string
  future: boolean
}

export type CreateKeyOptions = {
  seed?: string
  opened?: boolean
  safe?: boolean
  safeComment?: string
  dp?: DPArgs
  seedPassword?: string
}

export type DPArgs = [number?, number?, number?, string?]

export type KeyPairToCryptoKeyOptions = {
  rotation?: number
  id?: string
}

export const KEYCHAIN_ERROR_NO_KEY = 'KEYCHAIN_ERROR_NO_KEY'
export const KEYCHAIN_ERROR_UNSAFE_ACCESS = 'KEYCHAIN_ERROR_UNSAFE_ACCESS'
export const KEYCHAIN_ERROR_WRONG_DP = 'KEYCHAIN_ERROR_WRONG_DP'


export const KEYCHAIN_DEFAULT_KEY = '_identity'
