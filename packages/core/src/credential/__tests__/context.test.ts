require('dotenv').config()

import { nodeCryptoHelper } from "@owlmeans/regov-ssi-common"
import {
  buildDidHelper,
  buildDidRegistryWarpper,
  DIDDocument,
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION
} from "@owlmeans/regov-ssi-did"

import { 
  Presentation, 
  UnsignedPresentation, 
  buildCommonContext,
  CredentialSubject,
  CommonContext,
  Credential, 
  UnsignedCredential,
  buildKeyChain,
  MaybeArray
} from "../../index"


import util from 'util'
util.inspect.defaultOptions.depth = 8


const test: {
  ctx?: CommonContext
  unsigned?: UnsignedCredential<CredentialSubject>
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

    const subject = {
      data: {
        '@type': 'TestCredentialSubjectDataType',
        worker: 'Valentin Michalych'
      }
    }

    const key = await test.ctx.keys.getCryptoKey()
    const didUnsigned = await test.ctx.did.helper().createDID(
      key,
      {
        data: JSON.stringify(subject),
        hash: true,
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
      }
    )

    const did = await test.ctx.did.helper().signDID(key, didUnsigned)
    expect(await test.ctx.did.helper().verifyDID(did)).toBe(true)

    test.ctx.did.addDID(did)

    const unsingnedCredentail = await test.ctx.buildCredential({
      id: did.id,
      type: ['VerifiableCredential', 'TestCredential'],
      holder: test.ctx.did.helper().extractProofController(did),
      context: {
        '@version': 1.1,
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

    const did = <DIDDocument>await test.ctx.did.lookUpDid(test.unsigned.id)
    const credentail = await test.ctx.signCredential(
      test.unsigned, 
      did
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
    const [result, _] = await test.ctx.verifyCredential(test.credential)

    expect(result).toBe(true)
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

    const [result] = await test.ctx.verifyCredential(newCredential)

    expect(result).toBe(false)
  })

  it('creates unsigned verifiable Presentation', async () => {
    if (!test.ctx) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!test.credential) {
      throw 'Previous test didn\'t provide UnsingedCredential'
    }

    const did = <DIDDocument>await test.ctx.did.lookUpDid(test.credential.holder.id)

    const vp = await test.ctx?.buildPresentation(
      [test.credential],
      {
        holder: test.ctx.did.helper().extractProofController(did),
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

  it('signs verifiable Presentation', async () => {
    if (!test.ctx) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!test.unsignedP) {
      throw 'Previous test didn\'t provide UnsingedPresentation'
    }
    const did = await test.ctx.did.lookUpDid<DIDDocument>(test.unsignedP.holder.id)
    if (!did) {
      throw 'No related did in registry'
    }

    const vp = await test.ctx.signPresentation(test.unsignedP, did)

    test.presentation = vp

    expect(vp).toMatchSnapshot({
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
      ],
      proof: {
        jws: expect.any(String),
        verificationMethod: expect.any(String),
        challenge: expect.any(String) ,
        domain: expect.any(String),
        created: expect.any(String)
      }
    })
  })

  it('verifies verifiable Presentation', async () => {
    if (!test.ctx) {
      throw 'Setup didn\'t provide CommonContext'
    }
    if (!test.presentation) {
      throw 'Previous test didn\'t provide Presentation'
    }
    if (!test.presentation.id) {
      throw 'Previous test didn\'t provide Presentation with id'
    }

    const [result, _] = await test.ctx.verifyPresentation(test.presentation)

    expect(result).toBe(true)
  })
})