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

import { nodeCryptoHelper, buildKeyChain, KeyChainWrapper } from "@owlmeans/regov-ssi-core"
import { generateKeyPairFromSeed } from '@stablelib/x25519'
import { x25519Encrypter, x25519Decrypter, createJWE, decryptJWE, decodeJWT } from 'did-jwt'

import util from 'util'
import { cryptoKeyToCommKey } from "../util"
util.inspect.defaultOptions.depth = 6


describe('JWT', () => {
  let secret: Uint8Array, pubKey: Uint8Array, keyChain: KeyChainWrapper

  beforeAll(async () => {
    keyChain = await buildKeyChain({ crypto: nodeCryptoHelper, password: '11111111' })
    const ck = await cryptoKeyToCommKey(await keyChain.getCryptoKey())
    secret = ck.pk
    pubKey = generateKeyPairFromSeed(secret).publicKey
  })


  it('packs', async () => {
    const hash = nodeCryptoHelper.hash(Buffer.from(pubKey))
    const encrypter = x25519Encrypter(pubKey, hash)
    const arr = new Uint8Array(Buffer.from('test string', 'utf8'))
    const jwe = await createJWE(arr, [encrypter], {x: 1}, Buffer.from('zzz', 'utf8'))
    
    if (!jwe.aad) {
      throw new Error('No aad')
    }
    console.log(jwe, Buffer.from(jwe.aad, 'base64').toString('utf8'))

    const decrypter = await x25519Decrypter(secret)
    const decrypted8a = await decryptJWE(jwe, decrypter)
    const decrypted = Buffer.from(decrypted8a).toString('utf8')
    expect(decrypted).toBe('test string')
  })
})