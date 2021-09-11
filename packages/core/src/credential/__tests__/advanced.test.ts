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
  DIDPURPOSE_VERIFICATION,
  DIDVerificationItem,
  VERIFICATION_KEY_CONTROLLER,
  VERIFICATION_KEY_HOLDER
} from "@owlmeans/regov-ssi-did"
import { buildKeyChain } from "../../keys/model"

import { Presentation, UnsignedPresentation } from "../types"
import util from 'util'
util.inspect.defaultOptions.depth = 8

const test: {
  ctxAlice?: CommonContext
  ctxBob?: CommonContext
  ctxCharly?: CommonContext
  did?: DIDDocument
  cred?: Credential
} = {}

describe('Presentation Context', () => {
  it ('supports issuer -> holder -> verifier scenario', async () => {
    const ctxAlice = await buildCommonContext({
      keys: await buildKeyChain({
        password: '11111111',
        crypto: nodeCryptoHelper
      }),
      crypto: nodeCryptoHelper,
      did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
    })

    const ctxBob = await buildCommonContext({
      keys: await buildKeyChain({
        password: '11111111',
        crypto: nodeCryptoHelper
      }),
      crypto: nodeCryptoHelper,
      did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
    })

    const ctxCharly = await buildCommonContext({
      keys: await buildKeyChain({
        password: '11111111',
        crypto: nodeCryptoHelper
      }),
      crypto: nodeCryptoHelper,
      did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
    })

    const uAliceDid = await ctxAlice.did.helper().createDID(
      await ctxAlice.keys.getCryptoKey(),
      {
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION]
      }
    )
    const aliceDid = await ctxAlice.did.helper().signDID(
      await ctxAlice.keys.getCryptoKey(),
      uAliceDid
    )
    ctxAlice.did.addDID(aliceDid)

    const uBoxDid = await ctxBob.did.helper().createDID(
      await ctxBob.keys.getCryptoKey(),
      {
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION]
      }
    )
    const bobDid = await ctxBob.did.helper().signDID(
      await ctxBob.keys.getCryptoKey(),
      uBoxDid
    )
    ctxBob.did.addDID(bobDid)

    const subject = {
      data: {
        '@type': 'TestCredentialSubjectDataType',
        worker: 'Valentin Michalych'
      }
    }

    const uDepDid = await ctxAlice.did.helper().createDID(
      await ctxAlice.keys.getCryptoKey(),
      {
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION],
        data: JSON.stringify(subject),
        hash: true
      }
    )

    const uCred = await ctxAlice.buildCredential({
      id: uDepDid.id,
      type: ['VerifiableCredential', 'TestCredential'],
      holder: ctxAlice.did.helper().extractProofController(aliceDid),
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

    const depDid = await ctxBob.did.helper().signDID(
      await ctxBob.keys.getCryptoKey(),
      uDepDid,
      VERIFICATION_KEY_CONTROLLER,
      [DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
    )
    expect(await ctxCharly.did.helper().verifyDID(depDid)).toBe(true)

    const cred = await ctxBob.signCredential(uCred, depDid)
    ctxCharly.did.addPeerDID(bobDid)
    expect(await ctxCharly.verifyCredential(cred, depDid)).toContain(true)

    test.ctxAlice = ctxAlice
    test.ctxBob = ctxBob
    test.ctxCharly = ctxCharly
    test.did = depDid
    test.cred = cred
  })

  it ('support presentation verification', async () => {
    if (!test.ctxAlice) {
      throw new Error('Can\'t get Alice from perviouse test')
    }
    if (!test.ctxBob) {
      throw new Error('Can\'t get Bob from perviouse test')
    }
    if (!test.ctxCharly) {
      throw new Error('Can\'t get Charly from perviouse test')
    }
    if (!test.cred) {
      throw new Error('Can\'t get Credential from perviouse test')
    }
    if (!test.did) {
      throw new Error('Can\'t get DID from perviouse test')
    }
    
    const uPres = await test.ctxAlice.buildPresentation<typeof test.cred>(
      [test.cred],
      {
        holder: test.cred.holder.id,
        type: 'TestPresentation'
      }
    )

    const pres = await test.ctxAlice.signPresentation(
      uPres,
      test.did,
      { keyId: VERIFICATION_KEY_HOLDER }
    )

    expect(await test.ctxCharly.verifyPresentation(pres, test.did)).toContain(true)
  })
})