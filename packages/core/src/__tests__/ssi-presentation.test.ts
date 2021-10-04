require('dotenv').config()

import { buildSSICore } from "../vc/ssi"
import { SSICore } from "../vc/ssi/types"
import { Credential } from "../vc/types"
import { nodeCryptoHelper } from "@owlmeans/regov-ssi-common"
import {
  buildDidHelper,
  buildDidRegistryWarpper,
  DIDDocument,
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION,
  VERIFICATION_KEY_CONTROLLER,
  VERIFICATION_KEY_HOLDER
} from "@owlmeans/regov-ssi-did"
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
      holder: ssiAlice.did.helper().extractProofController(aliceDid),
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
        holder: test.cred.holder.id,
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