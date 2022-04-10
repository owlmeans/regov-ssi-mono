
import { nodeCryptoHelper, buildKeyChain, KeyChainWrapper } from "@owlmeans/regov-ssi-core"
import { generateKeyPairFromSeed } from '@stablelib/x25519'
import { x25519Encrypter, x25519Decrypter, createJWE, decryptJWE } from 'did-jwt'

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
    console.log(hash)
    const encrypter = x25519Encrypter(pubKey, hash)
    const arr = new Uint8Array(Buffer.from('test string', 'utf8'))
    const jwe = await createJWE(arr, [encrypter])

    const decrypter = await x25519Decrypter(secret)
    const decrypted8a = await decryptJWE(jwe, decrypter)
    const decrypted = Buffer.from(decrypted8a).toString('utf8')
    expect(decrypted).toBe('test string')
  })
})