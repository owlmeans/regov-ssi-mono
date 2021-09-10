
require('dotenv').config()

import { nodeCryptoHelper } from "@owlmeans/regov-ssi-common"

import {
  buildDidHelper,
  buildDidRegistryWarpper,
  DIDDocument,
  DIDPURPOSE_ASSERTION,
  DIDPURPOSE_AUTHENTICATION,
  DIDPURPOSE_VERIFICATION,
  DIDVerificationItem
} from "@owlmeans/regov-ssi-did"

import {
  buildKeyChain,
  Presentation,
  UnsignedPresentation,
  Credential,
  UnsignedCredentail,
  CommonContext,
  buildCommonContext
} from "../index"

import { } from "../credential/types"

const _test = async () => {
  const ctx = await buildCommonContext({
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

  const key = await ctx.keys.getCryptoKey()
  const didUnsigned = await ctx.did.helper().createDID(
    key,
    {
      data: JSON.stringify(subject),
      hash: true,
      purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
    }
  )

  const did = await ctx.did.helper().signDID(key, didUnsigned)

  ctx.did.addDID(did)

  const unsingnedC = await ctx.buildCredential({
    id: did.id,
    type: ['VerifiableCredential', 'TestCredential'],
    holder: <string>(<DIDVerificationItem[]>did.verificationMethod)[0].controller,
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

  const credential = await ctx.signCredential(unsingnedC, did)

  const [result, _] = await ctx.verifyCredential(credential)

  console.log('---- CREDENTIAL VERIFICATION ---')
  console.log(result, _)

  const unsignedP = await ctx.buildPresentation(
    [credential],
    {
      holder: <string>(<DIDVerificationItem[]>did.verificationMethod)[0].controller,
      type: 'TestPresentation'
    }
  )

  const vp = await ctx.signPresentation(unsignedP, did)

  const [result0, _0] = await ctx.verifyPresentation(vp)

  console.log('---- PRESENTATION VERIFICATION ---')
  console.log(result0, _0)
}

_test()