require('dotenv').config()

import { TestUtil as Util } from './utils/wallet'

import util from 'util'
util.inspect.defaultOptions.depth = 8


const _test = async ()=> {
  const alice = await Util.Wallet.setup('alice')
  const bob = await Util.Wallet.setup('bob')
  // const charly = await Util.Wallet.setup('charly')

  await alice.produceIdentity()
  await bob.produceIdentity()
  // await charly.produceIdentity()

  /**
   * @Case 1
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

  


  /**
   * @TODO Keep only identity exchange here
   * 
   * @Given Case 1
   * 1. Charly provide his identity to Bob
   * 2. Alice claims a document from Charly
   * 3. Charly signs the document
   * 4. Charly offers the signed document to Alice
   * 5. Alice confirms the signed document (Claim should be cleaned up)
   * 6. Bob requests the signed document from Alice by type and issuer
   * 7. Alice provides the requested document to Bob
   * 8. Bob verifies the document (Request should be cleaned up)
   */

  /**
   * @Given Case 2
   * 6. Alice provides the signed document to Bob
   * 7. Bob verifies the document (Request should be cleaned up)
   */
}

_test()
