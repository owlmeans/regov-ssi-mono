require('dotenv').config()

import util from 'util'
import { TestUtil as Util } from './utils/wallet'
util.inspect.defaultOptions.depth = 8


const _test = async ()=> {
  const alice = await Util.Wallet.setup('alice')
  const bob = await Util.Wallet.setup('bob')
  const charly = await Util.Wallet.setup('charly')

  await alice.produceIdentity()
  await bob.produceIdentity()
  await charly.produceIdentity()

  /**
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
