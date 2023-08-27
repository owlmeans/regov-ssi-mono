/**
 *  Copyright 2023 OwlMeans
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

import { LDKeyPair } from 'crypto-ld'
import { getCryptoAdapter } from './adapter'
import { cryptoHelper } from './helper'
// const { JwsLinkedDataSignature } = require('@digitalbazaar/jws-linked-data-signature')
import { JwsLinkedDataSignature } from '@digitalbazaar/jws-linked-data-signature'

export const KEY_TYPE = 'EcdsaSecp256k1Signature2019'
export const VERIFICATION_KEY_TYPE = 'EcdsaSecp256k1VerificationKey2019'

export class Secp256k1Key extends LDKeyPair implements Secp256k1CryptoKey {
  type: string

  pubKey?: Uint8Array

  pk?: Uint8Array

  id: string

  controller?: string

  static SUITE_CONTEXT = 'https://w3id.org/security/v2'

  constructor(options: Secp256k1KeyOptions) {
    super(options)
    this.type = VERIFICATION_KEY_TYPE
    this.pubKey = options.pubKey
    this.pk = options.pk
    this.id = options.id as string
  }

  publicNode(): {
    id: string
    type: string
    controller: string
    publicKeyHex: string | undefined
  } {
    return {
      id: this.id,
      type: this.type,
      controller: this.controller ?? '',
      publicKeyHex: getCryptoAdapter().base58.encode(Buffer.from(this.pubKey ?? [])),
    }
  }

  static async generate(options?: Secp256k1KeyOptions) {
    if (options?.id == null) {
      throw new Error('cryptosuite.generate.secp256k1')
    }

    return new this(options)
  }

  static async from(options?: Secp256k1KeyOptions) {
    return this.generate(options)
  }

  fingerprint() {
    // @TODO Think about some generation or exception
    return cryptoHelper.base58().encode(this.pubKey as Uint8Array)
  }

  verifyFingerprint({ fingerprint }: { fingerprint: string }) {
    try {
      const pubKey = cryptoHelper.base58().decode(fingerprint)
      if (pubKey.length !== this.pubKey?.length
        || this.pubKey.some((byte, idx) => byte !== pubKey[idx])) {
        return { error: 'cryptosuite.fingerprint.match.secp256k1', verified: false }
      }
    } catch (e) {
      return { error: e, verified: false }
    }

    return { verified: true }
  }

  signer() {
    const pk = this.pk as Uint8Array

    return {
      sign: async (options?: SigningOption) => {
        if (options?.data == null) {
          throw new Error('cryptosuite.signer.sign.noData')
        }

        const payload = Buffer.from(options.data.buffer, options.data.byteOffset, options.data.length)

        const adapter = getCryptoAdapter()
        const digest = adapter.sha256.toBytes(adapter.sha256.hash(Buffer.from(payload)))

        return Buffer.from(cryptoHelper.sign(digest, adapter.base58.encode(pk)), 'base64')
      }
    }
  }

  verifier() {
    const pubKey = this.pubKey as Uint8Array

    return {
      verify: async (options?: SigningOption) => {
        if (options?.data == null) {
          throw new Error('cryptosuite.verifier.verify.noData')
        }
        if (options?.signature == null) {
          throw new Error('cryptosuite.verifier.verify.noSignature')
        }

        const payload = Buffer.from(options.data.buffer, options.data.byteOffset, options.data.length)
        const adapter = getCryptoAdapter()
        const digest = adapter.sha256.toBytes(adapter.sha256.hash(Buffer.from(payload)))

        let verified: boolean
        try {
          verified = cryptoHelper.verify(
            Buffer.from(options.signature).toString("base64"), 
            digest, 
            adapter.base58.encode(pubKey)
          )
        } catch {
          verified = false
        }

        return verified
      }
    }
  }
}

interface SigningOption {
  data: { buffer: any, byteOffset: number, length: number }
  signature?: Uint8Array
}

export class Secp256k1Signature extends JwsLinkedDataSignature {
  constructor(options: Secp256k1SignatureOptions) {
    super({
      ...options, type: 'EcdsaSecp256k1Signature2019', alg: 'ES256K', LDKeyClass: Secp256k1Key,
    })

    this.requiredKeyType = 'EcdsaSecp256k1VerificationKey2019'
  }

  getVerificationMethod(): {
    id: string
    type: string
    controller: string
    publicKeyHex: string | undefined
  } {
    return this.key.publicNode()
  }

  ensureSuiteContext() {
  }
}

export interface Secp256k1CryptoKey {
  type: string

  pubKey?: Uint8Array

  pk?: Uint8Array

  id: string

  controller?: string

  revoked?: string
}

export interface Secp256k1KeyOptions {
  id: string
  controller?: string
  revoked?: string
  pubKey?: Uint8Array
  pk?: Uint8Array
}

export interface Secp256k1SignatureOptions {
  key?: {
    id: string
    signer: any
    verifier: any
  }
  singer?: any
  verifier?: any
  proof?: any
  date?: Date | string
  useNativeCanonize?: boolean
  canonizeOptions?: boolean
}
