
require('dotenv').config()

import { nodeCryptoHelper } from "@owlmeans/regov-ssi-common"

import {
  buildDidHelper,
  buildDidRegistryWarpper,
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION,
  VERIFICATION_KEY_CONTROLLER,
  VERIFICATION_KEY_HOLDER
} from "@owlmeans/regov-ssi-did"

import { buildKeyChain, buildSSICore } from "../index"

import util from 'util'
util.inspect.defaultOptions.depth = 8


const _test = async () => {
  const ssi = await buildSSICore({
    keys: await buildKeyChain({
      password: '11111111',
      crypto: nodeCryptoHelper
    }),
    crypto: nodeCryptoHelper,
    did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
  })

  const subject = {
    data: {
      '@type': 'TestCredentialSubjectDataType',
      worker: 'Valentin Michalych'
    }
  }

  const key = await ssi.keys.getCryptoKey()
  const didUnsigned = await ssi.did.helper().createDID(
    key,
    {
      data: JSON.stringify(subject),
      hash: true,
      purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
    }
  )

  const did = await ssi.did.helper().signDID(key, didUnsigned)

  ssi.did.addDID(did)

  const unsingnedC = await ssi.buildCredential({
    id: did.id,
    type: ['VerifiableCredential', 'TestCredential'],
    holder: ssi.did.helper().extractProofController(did),
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

  const credential = await ssi.signCredential(unsingnedC, did)

  const [result, _] = await ssi.verifyCredential(credential)

  console.log('---- CREDENTIAL VERIFICATION ---')
  console.log(result, _)

  const unsignedP = await ssi.buildPresentation(
    [credential],
    {
      holder: ssi.did.helper().extractProofController(did), // <string>(<DIDVerificationItem[]>did.verificationMethod)[0].controller,
      type: 'TestPresentation'
    }
  )

  const vp = await ssi.signPresentation(unsignedP, did)

  const [result0, _0] = await ssi.verifyPresentation(vp)

  console.log('---- PRESENTATION VERIFICATION ---')
  console.log(result0, _0)

  /**
   * @TODO Transform to tests
   */
  await (async () => {
    const ctxAlice = await buildSSICore({
      keys: await buildKeyChain({
        password: '11111111',
        crypto: nodeCryptoHelper
      }),
      crypto: nodeCryptoHelper,
      did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
    })

    const ctxBob = await buildSSICore({
      keys: await buildKeyChain({
        password: '11111111',
        crypto: nodeCryptoHelper
      }),
      crypto: nodeCryptoHelper,
      did: buildDidRegistryWarpper(buildDidHelper(nodeCryptoHelper))
    })

    const ctxCharly = await buildSSICore({
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
        purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_AUTHENTICATION],
        data: JSON.stringify(subject),
        hash: true
      }
    )

    const uCred = await ctxAlice.buildCredential({
      id: did.id,
      type: ['VerifiableCredential', 'TestCredential'],
      holder: ctxAlice.did.helper().extractProofController(aliceDid),
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

    const depDid = await ctxBob.did.helper().signDID(
      await ctxBob.keys.getCryptoKey(),
      uDepDid,
      VERIFICATION_KEY_CONTROLLER,
      [DIDPURPOSE_ASSERTION]
    )
    console.log('-- CHARLY CHECKS DEP DID --')
    console.log(depDid, await ctxCharly.did.helper().verifyDID(depDid))

    const cred = await ctxBob.signCredential(uCred, depDid)
    ctxCharly.did.addPeerDID(bobDid)
    console.log('-- CHARLY VERIFIES CRED --')
    console.log(await ctxCharly.verifyCredential(cred, depDid))

    const uPres = await ctxAlice.buildPresentation<typeof cred>(
      [cred],
      {
        holder: cred.holder.id,
        type: 'TestPresentation'
      }
    )

    const pres = await ctxAlice.signPresentation(
      uPres,
      depDid,
      { keyId: VERIFICATION_KEY_HOLDER }
    )

    console.log('-- CHARLY VERIFIES VP --')

    console.log(pres, await ctxCharly.verifyPresentation(pres, depDid))
  })()
}

_test()