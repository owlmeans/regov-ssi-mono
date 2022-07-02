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

import { nodeCryptoHelper } from "../common"
import {
  buildDidHelper, buildDidRegistryWarpper, DIDDocument, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION,
  VERIFICATION_KEY_HOLDER
} from "../did"
import {
  Presentation, UnsignedPresentation, buildSSICore, SSICore, Credential, UnsignedCredential, buildKeyChain
} from "../index"

import util from 'util'
util.inspect.defaultOptions.depth = 8


const test: {
  ssi?: SSICore
  unsigned?: UnsignedCredential<{}>
  credential?: Credential
  unsignedP?: UnsignedPresentation
  presentation?: Presentation
} = {}

beforeAll(async () => {
  test.ssi = await buildSSICore({
    keys: await buildKeyChain({
      password: '11111111',
      crypto: nodeCryptoHelper
    }),
    crypto: nodeCryptoHelper,
    did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
  })
})

describe('SSI Verifiable Credential', () => {
  it('creates Credentail', async () => {
    if (!test.ssi) {
      throw 'Setup didn\'t provide SSICore'
    }

    const subject = {
      data: {
        '@type': 'TestCredentialSubjectDataType',
        worker: 'Valentin Michalych'
      }
    }

    const key = await test.ssi.keys.getCryptoKey()
    const didUnsigned = await test.ssi.did.helper().createDID(
      key,
      {
        data: JSON.stringify(subject),
        hash: true,
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
      }
    )

    const did = await test.ssi.did.helper().signDID(key, didUnsigned)
    expect(await test.ssi.did.helper().verifyDID(did)).toBe(true)

    test.ssi.did.addDID(did)

    const unsingnedCredentail = await test.ssi.buildCredential({
      id: did.id,
      type: ['VerifiableCredential', 'TestCredential'],
      holder: did,
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

    test.unsigned = unsingnedCredentail
    expect(unsingnedCredentail).toMatchSnapshot({
      id: expect.any(String),
      holder: expect.any(Object),
      issuanceDate: expect.any(String)
    })
  })

  it('signs Credential', async () => {
    if (!test.ssi) {
      throw 'Setup didn\'t provide SSICore'
    }
    if (!test.unsigned) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }

    const did = <DIDDocument>await test.ssi.did.lookUpDid(test.unsigned.id)
    const credentail = await test.ssi.signCredential(
      test.unsigned,
      did,
      { keyId: VERIFICATION_KEY_HOLDER }
    )

    test.credential = credentail

    expect(credentail).toMatchSnapshot({
      id: expect.any(String),
      holder: expect.any(Object),
      issuer: expect.any(Object),
      issuanceDate: expect.any(String),
      proof: {
        created: expect.any(String),
        jws: expect.any(String),
        verificationMethod: expect.any(String),
      }
    })
  })

  it('verifies Credential', async () => {
    if (!test.ssi) {
      throw 'Setup didn\'t provide SSICore'
    }
    if (!test.credential) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }
    const [result, _] = await test.ssi.verifyCredential(test.credential)

    expect(result).toBe(true)
  })

  it('doesn\'t allow to temper subject', async () => {
    if (!test.ssi) {
      throw 'Setup didn\'t provide SSICore'
    }
    if (!test.credential) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }

    const newCredential = <Credential<{
      data: {
        '@type': string,
        worker: string
      }
    }>>{ ...test.credential }
    newCredential.credentialSubject = { ...newCredential.credentialSubject }
    newCredential.credentialSubject.data = { ...newCredential.credentialSubject.data }

    newCredential.credentialSubject.data.worker = `${newCredential.credentialSubject.data.worker}_`

    const [result] = await test.ssi.verifyCredential(newCredential)

    expect(result).toBe(false)
  })

  it('creates unsigned verifiable Presentation', async () => {
    if (!test.ssi) {
      throw 'Setup didn\'t provide SSICore'
    }
    if (!test.credential) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }

    const did = <DIDDocument>await test.ssi.did.lookUpDid((test.credential.holder as DIDDocument).id)

    const vp = await test.ssi?.buildPresentation(
      [test.credential],
      { id: did.id, holder: did, type: 'TestPresentation' }
    )

    test.unsignedP = vp

    expect(vp).toMatchSnapshot(
      {
        id: expect.any(String),
        holder: expect.any(Object),
        verifiableCredential: [
          {
            holder: expect.any(Object),
            id: expect.any(String),
            issuanceDate: expect.any(String),
            issuer: expect.any(Object),
            proof: {
              created: expect.any(String),
              jws: expect.any(String),
              verificationMethod: expect.any(String),
            }
          },
        ]
      }
    )
  })

  it('signs verifiable Presentation', async () => {
    if (!test.ssi) {
      throw 'Setup didn\'t provide SSICore'
    }
    if (!test.unsignedP) {
      throw 'Previous test didn\'t provide UnsingedPresentation'
    }
    const did = await test.ssi.did.lookUpDid<DIDDocument>((test.unsignedP.holder as DIDDocument).id)
    if (!did) {
      throw 'No related did in registry'
    }

    const vp = await test.ssi.signPresentation(test.unsignedP, did)

    test.presentation = vp

    expect(vp).toMatchSnapshot({
      id: expect.any(String),
      holder: expect.any(Object),
      verifiableCredential: [
        {
          holder: expect.any(Object),
          id: expect.any(String),
          issuanceDate: expect.any(String),
          issuer: expect.any(Object),
          proof: {
            created: expect.any(String),
            jws: expect.any(String),
            verificationMethod: expect.any(String),
          }
        },
      ],
      proof: {
        jws: expect.any(String),
        verificationMethod: expect.any(String),
        challenge: expect.any(String),
        domain: expect.any(String),
        created: expect.any(String)
      }
    })
  })

  it('verifies verifiable Presentation', async () => {
    if (!test.ssi) {
      throw 'Setup didn\'t provide SSICore'
    }
    if (!test.presentation) {
      throw 'Previous test didn\'t provide Presentation'
    }
    if (!test.presentation.id) {
      throw 'Previous test didn\'t provide Presentation with id'
    }

    const [result, _] = await test.ssi.verifyPresentation(test.presentation)

    expect(result).toBe(true)
  })
})