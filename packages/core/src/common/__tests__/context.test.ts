require('dotenv').config()

import { buildCommonContext } from "common/context"
import { CommonContext } from "common/types"
import { Credential, UnsignedCredentail } from "credential/types"
import { nodeCryptoHelper } from "metabelarusid-common"
import { buildDidHelper } from "metabelarusid-did"
import { buildKeyChain } from "keys/model"

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
    did: buildDidHelper(nodeCryptoHelper)
  })
})

describe('Credential Model', () => {
  it('Creates Credentail', async () => {
    if (!testContext.commonContext) {
      throw 'Setup didn\'t provide CommonContext'
    }
    const unsingnedCredentail = await testContext.commonContext.buildCredential({
      id: 'did:peer:doc',
      type: ['VerifiableCredential', 'TestCredential'],
      holder: 'did:peer:holder',
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
      subject: {
        data: {
          '@type': 'TestCredentialSubjectDataType',
          worker: 'Valentin Michalych'
        }
      }
    })

    testContext.unsignedCredential = unsingnedCredentail
    expect(unsingnedCredentail).toMatchSnapshot({
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

    const credentail = await testContext.commonContext.signCredential(
      testContext.unsignedCredential,
      'did:peer:issuer',
      await testContext.commonContext.keys.getCryptoKey()
    )

    testContext.signedCredential = credentail

    expect(credentail).toMatchSnapshot({
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

    const [result] = await testContext.commonContext.verifyCredential(
      testContext.signedCredential,
      await testContext.commonContext.keys.getCryptoKey()
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
      did: buildDidHelper(nodeCryptoHelper)
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