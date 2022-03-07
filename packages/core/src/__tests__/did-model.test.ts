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

require('dotenv').config()

import {
  buildDidHelper, nodeCryptoHelper, normalizeValue, DIDDocument, DIDPURPOSE_ASSERTION, 
  DIDPURPOSE_VERIFICATION, buildDidRegistryWarpper, VERIFICATION_KEY_CONTROLLER
} from "../index"

import util from 'util'
util.inspect.defaultOptions.depth = 8


const ctx: {
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

    ctx['didDoc'] = didDoc
    expect(didDoc).toMatchSnapshot({
      id: expect.any(String),
      verificationMethod: [{
        id: expect.any(String),
        nonce: expect.any(String),
        controller: expect.any(String),
        publicKeyBase58: expect.any(String),
      }],
      assertionMethod: [
        expect.any(String),
      ],
      proof: {
        created: expect.any(String),
        jws: expect.any(String),
        verificationMethod: expect.any(String),
      }
    })
  })

  it('verifies DID Document from itself', async () => {
    if (!ctx.didDoc) {
      throw new Error('No DID doc from pervious test')
    }
    const result = await didHelper.verifyDID(ctx.didDoc)

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

    const didDoc = await didHelper.signDID(
      bobKey,
      didDocUnsinged,
      VERIFICATION_KEY_CONTROLLER,
      [DIDPURPOSE_ASSERTION]
    )

    ctx.holderDoc = didDoc
  })

  it('verifies holder veriable did', async () => {
    if (!ctx.holderDoc) {
      throw new Error('No DID doc from pervious test')
    }
    const result = await didHelper.verifyDID(ctx.holderDoc)

    expect(result).toBe(true)
  })

  it('fails on tempered data', async () => {
    if (!ctx.holderDoc) {
      throw new Error('No DID doc from pervious test')
    }

    const brokenDoc = <DIDDocument>JSON.parse(JSON.stringify(ctx.holderDoc))
    if (brokenDoc.verificationMethod && normalizeValue(brokenDoc.verificationMethod).length > 0
      && typeof brokenDoc.proof === 'object') {
      brokenDoc.proof.created = new Date().toUTCString()
    }
    const result = await didHelper.verifyDID(brokenDoc)

    expect(result).toBe(false)
  })
})