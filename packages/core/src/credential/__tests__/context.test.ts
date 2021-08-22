require('dotenv').config()

import { buildCommonContext } from "../context"
import { CommonContext } from "../context/types"
import { Credential, UnsignedCredentail } from "../types"
import { nodeCryptoHelper } from "metabelarusid-common"
import { buildDidHelper, buildDidRegistryWarpper, DIDDocument, DIDPURPOSE_ASSERTION, DIDPURPOSE_VERIFICATION } from "metabelarusid-did"
import { buildKeyChain } from "../../keys/model"

import util from 'util'
util.inspect.defaultOptions.depth = 8


const testContext: {
  commonContext?: CommonContext
  unsignedCredential?: UnsignedCredentail
  signedCredential?: Credential
} = {}

beforeAll(async () => {
  testContext.commonContext = await buildCommonContext({
    keys: await buildKeyChain({
      password: '11111111',
      crypto: nodeCryptoHelper
    }),
    crypto: nodeCryptoHelper,
    did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
  })
})

describe('Credential Model', () => {
  it('Creates Credentail', async () => {
    if (!testContext.commonContext) {
      throw 'Setup didn\'t provide CommonContext'
    }

    const didWrapper = testContext.commonContext.did
    const keys = testContext.commonContext.keys

    const subject = {
      data: {
        '@type': 'TestCredentialSubjectDataType',
        worker: 'Valentin Michalych'
      }
    }

    const key = await keys.getCryptoKey()
    const didUnsigned = await didWrapper.helper().createDID(
      key, {
        data: JSON.stringify(subject),
        hash: true,
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION]
      }
    )

    const did = await didWrapper.helper().signDID(key, didUnsigned)
    didWrapper.addDID(did)

    const unsingnedCredentail = await testContext.commonContext.buildCredential({
      id: did.id,
      type: ['VerifiableCredential', 'TestCredential'],
      holder: did.proof.controller,
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

    testContext.unsignedCredential = unsingnedCredentail
    expect(unsingnedCredentail).toMatchSnapshot({
      id: expect.any(String),
      holder: {
        id: expect.any(String)
      },
      issuanceDate: expect.any(String)
    })
  })

  it('Signs Credential', async () => {
    if (!testContext.commonContext) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!testContext.unsignedCredential) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }

    const didWrapper = testContext.commonContext.did
    const keys = testContext.commonContext.keys

    const did = <DIDDocument>await didWrapper.lookUpDid(testContext.unsignedCredential.id)
    const key = await didWrapper.extractKey(`${did.proof.controller}#${DIDPURPOSE_ASSERTION}-1`)
    await keys.expandKey(key)

    const credentail = await testContext.commonContext.signCredential(
      testContext.unsignedCredential,
      did.proof.controller,
      await keys.getCryptoKey()
    )

    testContext.signedCredential = credentail

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

  it('Verifies Credential', async () => {
    if (!testContext.commonContext) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!testContext.signedCredential) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }
    const didWrapper = testContext.commonContext.did
    const did = <DIDDocument>await didWrapper.lookUpDid(testContext.signedCredential.id)

    const [result] = await testContext.commonContext.verifyCredential(
      testContext.signedCredential,
      await didWrapper.extractKey(did.id)
    )

    expect(result).toBe(true)
  })

  it('Fails with the key of another issuer key', async () => {
    if (!testContext.commonContext) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!testContext.signedCredential) {
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

    const [result] = await testContext.commonContext.verifyCredential(
      testContext.signedCredential,
      cryptoKey
    )

    expect(result).toBe(false)
  })

  it('Fails with new issuer key', async () => {
    if (!testContext.commonContext) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!testContext.signedCredential) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }

    await testContext.commonContext.keys.createKey('newKey')
    const cryptoKey = await testContext.commonContext.keys.getCryptoKey('newKey')

    const [result] = await testContext.commonContext.verifyCredential(
      testContext.signedCredential,
      cryptoKey
    )

    expect(result).toBe(false)
  })

  it('Doesn\'t allow to temper subject', async () => {
    if (!testContext.commonContext) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!testContext.signedCredential) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }

    const newCredential = <Credential<{
      data: {
        '@type': string,
        worker: string
      }
    }>>{ ...testContext.signedCredential }
    newCredential.credentialSubject = { ...newCredential.credentialSubject }
    newCredential.credentialSubject.data = { ...newCredential.credentialSubject.data }

    newCredential.credentialSubject.data.worker = `${newCredential.credentialSubject.data.worker}_`

    const [result] = await testContext.commonContext.verifyCredential(
      newCredential,
      await testContext.commonContext.keys.getCryptoKey()
    )

    expect(result).toBe(false)
  })
})