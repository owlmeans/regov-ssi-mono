require('dotenv').config()

import { buildCommonContext } from "../context"
import { CommonContext } from "../context/types"
import { Credential, UnsignedCredentail } from "../types"
import { nodeCryptoHelper } from "@owlmeans/regov-ssi-common"
import {
  buildDidHelper,
  buildDidRegistryWarpper,
  DIDDocument,
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION
} from "@owlmeans/regov-ssi-did"
import { buildKeyChain } from "../../keys/model"

import util from 'util'
import { Presentation, UnsignedPresentation } from "../types"
util.inspect.defaultOptions.depth = 8


const test: {
  ctx?: CommonContext
  unsigned?: UnsignedCredentail
  credential?: Credential
  unsignedP?: UnsignedPresentation
  presentation?: Presentation
} = {}

beforeAll(async () => {
  test.ctx = await buildCommonContext({
    keys: await buildKeyChain({
      password: '11111111',
      crypto: nodeCryptoHelper
    }),
    crypto: nodeCryptoHelper,
    did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
  })
})

describe('Credential Context', () => {
  it('creates Credentail', async () => {
    if (!test.ctx) {
      throw 'Setup didn\'t provide CommonContext'
    }

    const didWrapper = test.ctx.did
    const keys = test.ctx.keys

    const subject = {
      data: {
        '@type': 'TestCredentialSubjectDataType',
        worker: 'Valentin Michalych'
      }
    }

    const key = await keys.getCryptoKey()
    const didUnsigned = await didWrapper.helper().createDID(
      key,
      {
        data: JSON.stringify(subject),
        hash: true,
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
      }
    )

    const did = await didWrapper.helper().signDID(key, didUnsigned)
    expect(await didWrapper.helper().verifyDID(did)).toBe(true)

    didWrapper.addDID(did)

    const unsingnedCredentail = await test.ctx.buildCredential({
      id: did.id,
      type: ['VerifiableCredential', 'TestCredential'],
      holder: didWrapper.helper().extractProofController(did),
      context: {
        '@version': 1.1,
        meta: 'https://meta-id.meta-belarus.org/vc-schema#',
        data: {
          '@id': 'meta:data',
          '@type': '@id',
          '@context': {
            worker: { '@id': 'meta:worker', '@type': 'xsd:string' }
          }
        }
      },
      subject
    })

    test.unsigned = unsingnedCredentail
    expect(unsingnedCredentail).toMatchSnapshot({
      id: expect.any(String),
      holder: {
        id: expect.any(String)
      },
      issuanceDate: expect.any(String)
    })
  })

  it('signs Credential', async () => {
    if (!test.ctx) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!test.unsigned) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }

    const didWrapper = test.ctx.did
    const keys = test.ctx.keys

    const did = <DIDDocument>await didWrapper.lookUpDid(test.unsigned.id)
    const controller = didWrapper.helper().extractProofController(did)
    const key = await didWrapper.extractKey(controller)
    await keys.expandKey(key)

    const credentail = await test.ctx.signCredential(
      test.unsigned,
      controller,
      await keys.getCryptoKey()
    )

    test.credential = credentail

    expect(credentail).toMatchSnapshot({
      id: expect.any(String),
      holder: {
        id: expect.any(String)
      },
      issuer: expect.any(String),
      issuanceDate: expect.any(String),
      proof: {
        created: expect.any(String),
        jws: expect.any(String),
        verificationMethod: expect.any(String),
      }
    })
  })

  it('verifies Credential', async () => {
    if (!test.ctx) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!test.credential) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }
    const didWrapper = test.ctx.did
    const did = <DIDDocument>await didWrapper.lookUpDid(test.credential.id)
    const controller = didWrapper.helper().extractProofController(did)
    const key = await didWrapper.extractKey(controller)

    const [result, _] = await test.ctx.verifyCredential(test.credential, key)

    expect(result).toBe(true)
  })

  it('fails with the key of another issuer key', async () => {
    if (!test.ctx) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!test.credential) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }

    const anotherContext = await buildCommonContext({
      keys: await buildKeyChain({
        password: '11111111',
        crypto: nodeCryptoHelper
      }),
      crypto: nodeCryptoHelper,
      did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
    })
    const cryptoKey = await anotherContext.keys.getCryptoKey()

    const [result] = await test.ctx.verifyCredential(
      test.credential,
      cryptoKey
    )

    expect(result).toBe(false)
  })

  it('fails with new issuer key', async () => {
    if (!test.ctx) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!test.credential) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }

    await test.ctx.keys.createKey('newKey')
    const cryptoKey = await test.ctx.keys.getCryptoKey('newKey')

    const [result] = await test.ctx.verifyCredential(
      test.credential,
      cryptoKey
    )

    expect(result).toBe(false)
  })

  it('doesn\'t allow to temper subject', async () => {
    if (!test.ctx) {
      throw 'Setup didn\'t provide CommonContext'
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

    const [result] = await test.ctx.verifyCredential(
      newCredential,
      await test.ctx.keys.getCryptoKey()
    )

    expect(result).toBe(false)
  })

  it('creates unsigned verifiable presentation', async () => {
    if (!test.ctx) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!test.credential) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }

    const didWrapper = test.ctx.did
    // In test we take did document of the credential itself
    const did = <DIDDocument>await didWrapper.lookUpDid(test.credential.holder.id)

    const vp = await test.ctx?.buildPresentation(
      [test.credential],
      {
        holder: did,
        type: 'TestPresentation'
      }
    )

    test.unsignedP = vp

    expect(vp).toMatchSnapshot(
      {
        id: expect.any(String),
        holder: {
          id: expect.any(String)
        },
        verifiableCredential: [
          {
            holder: {
              id: expect.any(String),
            },
            id: expect.any(String),
            issuanceDate: expect.any(String),
            issuer: expect.any(String),
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

  it('signs verifiable presentation', async () => {
    if (!test.ctx) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!test.unsignedP) {
      throw 'Previous test didn\'t provide UnsingedPresentation'
    }
    const did = <DIDDocument>await test.ctx.did.lookUpDid(test.unsignedP.holder.id)
    if (!did) {
      throw 'No related did in registry'
    }

    const controller = test.ctx.did.helper().extractProofController(did)
    const key = await test.ctx.did.extractKey(`${controller}#${DIDPURPOSE_AUTHENTICATION}-1`)
    await test.ctx.keys.expandKey(key)

    // console.log(test.unsignedP)

    const vp = await test.ctx.signPresentation(test.unsignedP, did, key)

    // console.log(vp)
  })
})