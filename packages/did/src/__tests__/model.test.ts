require('dotenv').config()

import { buildDidHelper } from "model"
import { DIDDocumnet } from "types"
import { nodeCryptoHelper } from "../../../common/src"


const testContext: {
  didDoc?: DIDDocumnet
} = {}

describe('DID Helper', () => {
  const didHelper = buildDidHelper(nodeCryptoHelper)

  it('Creates DID Id', async () => {
    const key = await nodeCryptoHelper.getKey(await nodeCryptoHelper.getRandomBytes(32))
    const id = didHelper.makeDIDId(key)
    const described = id.split(':')
    expect(described.length).toBe(3)
    expect(described).toContain('did')
    expect(described).toContain(process.env.DID_PREFIX)
    expect(typeof described[2]).toBe('string')
  })

  it('Creates a DID Document', async () => {
    const key = await nodeCryptoHelper.getKey(await nodeCryptoHelper.getRandomBytes(32))

    const didDoc = await didHelper.createDID(key, {
      data: 'Hello world!',
      hash: true
    })

    testContext['didDoc'] = didDoc
    expect(didDoc).toMatchSnapshot({
      id: expect.any(String),
      verificationMethod: [{
        id: expect.any(String),
        publicKeyBase58: expect.any(String)
      }],
      proof: {
        controller: expect.any(String),
        nonce: expect.any(String),
        created: expect.any(String),
        signature: expect.any(String),
        verificationMethod: expect.any(String),
      },
      publicKey: [{
        id: expect.any(String),
        publicKeyBase58: expect.any(String),
      }]
    })
  })

  it('Verifies DID Document from itself', async () => {
    if (!testContext.didDoc) {
      throw new Error('No DID doc from pervious test')
    }
    const result = didHelper.verifyDID(testContext.didDoc)

    expect(result).toBe(true)
  })
})