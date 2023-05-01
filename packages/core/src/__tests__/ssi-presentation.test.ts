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

require('dotenv').config()

import { buildSSICore } from "../vc/ssi"
import { SSICore } from "../vc/ssi/types"
import { Credential } from "../vc/types"
import { nodeCryptoHelper } from "../common"
import {
  buildDidHelper, buildDidRegistryWarpper, DIDDocument, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION, VERIFICATION_KEY_CONTROLLER, VERIFICATION_KEY_HOLDER
} from "../did"
import { buildKeyChain } from "../keys/model"

import util from 'util'
util.inspect.defaultOptions.depth = 8


const test: {
  ssiAlice?: SSICore
  ssiBob?: SSICore
  ssiCharly?: SSICore
  did?: DIDDocument
  cred?: Credential
} = {}

describe('SSI Presentation', () => {
  it ('supports issuer -> holder -> verifier scenario', async () => {
    const ssiAlice = await buildSSICore({
      keys: await buildKeyChain({
        password: '11111111',
        crypto: nodeCryptoHelper
      }),
      crypto: nodeCryptoHelper,
      did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
    })

    const ssiBob = await buildSSICore({
      keys: await buildKeyChain({
        password: '11111111',
        crypto: nodeCryptoHelper
      }),
      crypto: nodeCryptoHelper,
      did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
    })

    const ssiCharly = await buildSSICore({
      keys: await buildKeyChain({
        password: '11111111',
        crypto: nodeCryptoHelper
      }),
      crypto: nodeCryptoHelper,
      did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
    })

    const uAliceDid = await ssiAlice.did.helper().createDID(
      await ssiAlice.keys.getCryptoKey(),
      {
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION]
      }
    )
    const aliceDid = await ssiAlice.did.helper().signDID(
      await ssiAlice.keys.getCryptoKey(),
      uAliceDid
    )
    ssiAlice.did.addDID(aliceDid)

    const uBoxDid = await ssiBob.did.helper().createDID(
      await ssiBob.keys.getCryptoKey(),
      {
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION]
      }
    )
    const bobDid = await ssiBob.did.helper().signDID(
      await ssiBob.keys.getCryptoKey(),
      uBoxDid
    )
    ssiBob.did.addDID(bobDid)

    const subject = {
      data: {
        '@type': 'TestCredentialSubjectDataType',
        worker: 'Valentin Michalych'
      }
    }

    const uDepDid = await ssiAlice.did.helper().createDID(
      await ssiAlice.keys.getCryptoKey(),
      {
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_AUTHENTICATION],
        data: JSON.stringify(subject),
        hash: true
      }
    )

    const uCred = await ssiAlice.buildCredential({
      id: uDepDid.id,
      type: ['VerifiableCredential', 'TestCredential'],
      holder: aliceDid,
      context: {
        '@version': 1.1,
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        exam: 'https://example.org/vc-schema#',
        data: {
          '@id': 'exam:data',
          '@type': '@id',
          '@context': {
            worker: { '@id': 'exam:worker', '@type': 'xsd:string' }
          }
        }
      },
      subject
    })

    const depDid = await ssiBob.did.helper().signDID(
      await ssiBob.keys.getCryptoKey(),
      uDepDid,
      VERIFICATION_KEY_CONTROLLER,
      [DIDPURPOSE_ASSERTION]
    )
    expect(await ssiCharly.did.helper().verifyDID(depDid)).toBe(true)

    const cred = await ssiBob.signCredential(uCred, depDid)
    ssiCharly.did.addPeerDID(bobDid)
    expect(await ssiCharly.verifyCredential(cred, depDid)).toContain(true)

    test.ssiAlice = ssiAlice
    test.ssiBob = ssiBob
    test.ssiCharly = ssiCharly
    test.did = depDid
    test.cred = cred
  })

  it ('support presentation verification', async () => {
    if (!test.ssiAlice) {
      throw new Error('Can\'t get Alice from perviouse test')
    }
    if (!test.ssiBob) {
      throw new Error('Can\'t get Bob from perviouse test')
    }
    if (!test.ssiCharly) {
      throw new Error('Can\'t get Charly from perviouse test')
    }
    if (!test.cred) {
      throw new Error('Can\'t get Credential from perviouse test')
    }
    if (!test.did) {
      throw new Error('Can\'t get DID from perviouse test')
    }
    
    const uPres = await test.ssiAlice.buildPresentation<typeof test.cred>(
      [test.cred],
      {
        holder: test.cred.holder,
        type: 'TestPresentation'
      }
    )

    const pres = await test.ssiAlice.signPresentation(
      uPres,
      test.did,
      { keyId: VERIFICATION_KEY_HOLDER }
    )

    expect(await test.ssiCharly.verifyPresentation(pres, test.did)).toContain(true)
  })
})