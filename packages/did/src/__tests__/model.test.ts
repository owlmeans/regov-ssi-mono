require('dotenv').config()

import { 
  buildDidHelper,
  DIDDocument, DIDPURPOSE_ASSERTION, DIDPURPOSE_VERIFICATION,
  buildDidRegistryWarpper, VERIFICATION_KEY_CONTROLLER
} from "../index"
import { nodeCryptoHelper } from "@owlmeans/regov-ssi-common"

import util from 'util'
util.inspect.defaultOptions.depth = 8


const testContext: {
  didDoc?: DIDDocument
  holderDoc?: DIDDocument
} = {}

describe('DID Helper', () => {
  const didHelper = buildDidHelper(nodeCryptoHelper)
  buildDidRegistryWarpper(didHelper)

  it('creates DID Id', async () => {
    const key = await nodeCryptoHelper.getKey(await nodeCryptoHelper.getRandomBytes(32))
    const id = didHelper.makeDIDId(key)
    const described = id.split(':')
    expect(described.length).toBe(3)
    expect(described).toContain('did')
    expect(described).toContain(process.env.DID_PREFIX)
    expect(typeof described[2]).toBe('string')
  })

  it('creates a DID Document', async () => {
    const key = await nodeCryptoHelper.getKey(await nodeCryptoHelper.getRandomBytes(32))

    const didDocUnsinged = await didHelper.createDID(key, {
      purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION],
      data: 'Hello world!',
      hash: true
    })

    const didDoc = await didHelper.signDID(key, didDocUnsinged)

    testContext['didDoc'] = didDoc
    expect(didDoc).toMatchSnapshot({
      id: expect.any(String),
      verificationMethod: [{
        id: expect.any(String),
        nonce: expect.any(String),
        controller: expect.any(String),
      }],
      assertionMethod: [
        expect.any(String),
      ],
      proof: {
        created: expect.any(String),
        jws: expect.any(String),
        verificationMethod: expect.any(String),
      },
      publicKey: [{
        id: expect.any(String),
        publicKeyBase58: expect.any(String),
      }]
    })
  })

  it('verifies DID Document from itself', async () => {
    if (!testContext.didDoc) {
      throw new Error('No DID doc from pervious test')
    }
    const result = await didHelper.verifyDID(testContext.didDoc)

    expect(result).toBe(true)
  })

  it('produces holder / controller verifiable did', async () => {
    const aliceKey = await nodeCryptoHelper.getKey(await nodeCryptoHelper.getRandomBytes(32))
    aliceKey.nextKeyDigest = 'nkdigest-simulation'
    const bobKey = await nodeCryptoHelper.getKey(await nodeCryptoHelper.getRandomBytes(32))
    bobKey.nextKeyDigest = 'nkdigest-simulation'

    const didDocUnsinged = await didHelper.createDID(aliceKey, {
      purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION],
      data: 'Hello world!',
      hash: true
    })

    const didDoc = await didHelper.signDID(bobKey, didDocUnsinged, VERIFICATION_KEY_CONTROLLER)

    testContext.holderDoc = didDoc
  })

  it('verifies holder veriable did', async () => {
    if (!testContext.holderDoc) {
      throw new Error('No DID doc from pervious test')
    }
    const result = await didHelper.verifyDID(testContext.holderDoc)

    expect(result).toBe(true)
  })

  it('fails on tempered data', async () => {
    if (!testContext.holderDoc) {
      throw new Error('No DID doc from pervious test')
    }

    const brokenDoc = <DIDDocument>JSON.parse(JSON.stringify(testContext.holderDoc))
    if (brokenDoc.verificationMethod && brokenDoc.verificationMethod[0]
      && typeof brokenDoc.verificationMethod[0] === 'object'
      && typeof brokenDoc.verificationMethod[0].proof === 'object') {
      brokenDoc.verificationMethod[0].proof.created = new Date().toUTCString()
    }
    const result = await didHelper.verifyDID(brokenDoc)

    expect(result).toBe(false)
  })
})