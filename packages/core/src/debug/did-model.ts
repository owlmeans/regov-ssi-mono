require('dotenv').config()

import {
  buildDidHelper, DIDPURPOSE_ASSERTION, DIDPURPOSE_VERIFICATION, buildDidRegistryWarpper,
  VERIFICATION_KEY_CONTROLLER, nodeCryptoHelper
} from "../index"


const _test = async () => {
  const helper = buildDidHelper(nodeCryptoHelper)
  buildDidRegistryWarpper(helper)

  const key = await nodeCryptoHelper.getKey(await nodeCryptoHelper.getRandomBytes(32))

  const didDocUnsinged = await helper.createDID(key, {
    purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION],
    data: 'Hello world!',
    hash: true
  })

  const didDoc = await helper.signDID(key, didDocUnsinged)
  console.log('-- DID DOCUMENT --')
  console.log(didDoc)

  const result = await helper.verifyDID(didDoc)
  console.log('Verfification result', result)

  const aliceKey = await nodeCryptoHelper.getKey(await nodeCryptoHelper.getRandomBytes(32))
  aliceKey.nextKeyDigest = 'nkdigest-simulation'
  const bobKey = await nodeCryptoHelper.getKey(await nodeCryptoHelper.getRandomBytes(32))
  bobKey.nextKeyDigest = 'nkdigest-simulation'

  const depDocUnsinged = await helper.createDID(aliceKey, {
    purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION],
    data: 'Hello world!',
    hash: true
  })

  const depDoc = await helper.signDID(bobKey, depDocUnsinged, VERIFICATION_KEY_CONTROLLER)
  console.log('-- DEP DID DOCUMENT --')
  console.log(depDoc)

  const depResult = await helper.verifyDID(depDoc)
  console.log('Verification result', depResult)
}

_test()