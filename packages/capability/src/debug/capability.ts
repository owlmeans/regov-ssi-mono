require('dotenv').config()

import { governanceCredentialHelper } from '../governance/credential'
import { TestUtil as Util } from './utils/wallet'

import util from 'util'
util.inspect.defaultOptions.depth = 8;


(async () => {
  const alice = await Util.Wallet.setup('alice')
  const bob = await Util.Wallet.setup('bob')
  const charly = await Util.Wallet.setup('charly')
  const dan = await Util.Wallet.setup('dan')

  await alice.produceIdentity()
  await bob.produceIdentity()
  await charly.produceIdentity()
  await dan.produceIdentity()

  const charlyIdentity = await charly.provideIdentity()

  // console.log(charlyIdentity.verifiableCredential[0].credentialSubject.data.identity)

  const identity = charlyIdentity.verifiableCredential[0].credentialSubject.data.identity

  const claim = await governanceCredentialHelper(charly.wallet).claimGovernance(
    identity, { name: 'Governance Claim' }
  )

  const offer = await governanceCredentialHelper(charly.wallet).offer(claim)

  console.log(offer)
})()