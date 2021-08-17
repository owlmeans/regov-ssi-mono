import { buildCommonContext } from "common/context"
import { CommonContext } from "common/types"
import { buildCreateCrednetialMethod, buildSignCredentialMethod } from "credential/model"
import { CredentialSubjectType, UnsignedCredentail } from "credential/types"
import { nodeCryptoContext } from "crypto/context/node"
import { buildKeyChain } from "keys/model"

import util from 'util'
util.inspect.defaultOptions.depth = 8

const testContext: {
  commonContext?: CommonContext
  unsignedCredential?: UnsignedCredentail
} = {}

beforeAll(async () => {
  testContext.commonContext = await buildCommonContext({
    keyChain: await buildKeyChain('11111111'),
    cryptoContext: nodeCryptoContext
  })
})

describe('Credential Model', () => {
  it('Create Credentail', async () => {
    if (!testContext.commonContext) {
      throw 'Setup didn\'t provide CommonContext'
    }
    const createCredential = buildCreateCrednetialMethod(testContext.commonContext)
    const unsingnedCredentail = await createCredential<
      CredentialSubjectType & { worker: string }
    >(
      ['VerifiableCredential', 'TestCredential'],
      {
        data: {
          '@type': 'TestCredentialSubjectDataType',
          worker: 'Valentin Michalych'
        }
      },
      'did:peer:yyyy',
      {
        '@version': 1.1,
        meta: 'https://meta-id.meta-belarus.org/vc-schema#',
        data: {
          '@id': 'meta:data',
          '@type': '@id',
          '@context': {
            worker: { '@id': 'meta:worker', '@type': 'xsd:string' }
          }
        }
      }
    )

    testContext.unsignedCredential = unsingnedCredentail
    expect(unsingnedCredentail).toMatchSnapshot({
      issuanceDate: expect.any(String)
    })
  })

  it('Sing Credential', async () => {
    if (!testContext.commonContext) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!testContext.unsignedCredential) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }
    const signCredential = buildSignCredentialMethod(testContext.commonContext)
    const credentail = await signCredential(testContext.unsignedCredential, 'did:peer:zzzzz')

    expect(credentail).toMatchSnapshot({
      issuanceDate: expect.any(String),
      proof: {
        created: expect.any(String),
        jws: expect.any(String),
        verificationMethod: expect.any(String)
      }
    })
  })
})