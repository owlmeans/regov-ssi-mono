require('dotenv').config()

import { TestUtil as Util } from './utils/wallet'

import util from 'util'
util.inspect.defaultOptions.depth = 8


const _test = async ()=> {
  const alice = await Util.Wallet.setup('alice')
  const bob = await Util.Wallet.setup('bob')

  await alice.produceIdentity()
  await bob.produceIdentity()

  /**
   * @CASE 1
   * 1. Alice requests an identity from Bob
   * 2. Bob provides his identity
   * 3. Alice adds Bobs identity (request is cleaned up, self validation is allowed)
   */
  const idRequst = await alice.requestIdentity()
  const reqValidation = await bob.validateRequest(idRequst)
  console.log('IDENTITY REQUEST VALIDATION', reqValidation)
  const idResponse = await bob.provideIdentity(idRequst)
  const [resValidation, id] = await alice.validateIdentityResponse(idResponse)
  console.log('IDENTITY RESPONSE VALIDATION', resValidation)
}

_test()
