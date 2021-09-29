require('dotenv').config()

import { TestUtil as Util } from './utils/wallet'

import util from 'util'
util.inspect.defaultOptions.depth = 8;

/**
 * @TODO It looks like we need to start developing test
 * cases and bundle helpers based on them.
 * Case 1: 
 * 1. Charly provides Bob a Capability. 
 * 2. Bob signs a capability based credentail to Alice. 
 * 3. Dan trusts charly. 
 * 4. Alice shows the credential to Dan. 
 * 5. Dan aknowledge credential as trusted.
 * 
 * Case 2: The same. But Bob hires Emma and delegate capability to her.
 * Emma signs credential istead of Bob. But Dan still aknowledges it.
 */
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

  await charly.selfIssueGovernance(charlyIdentity)

  await bob.trustIdentity(charlyIdentity)
  await alice.trustIdentity(charlyIdentity)
  await dan.trustIdentity(charlyIdentity)

  const requestGov = await bob.requestGovernance()

  const gov = await charly.responseGovernance(requestGov)

  const CRED_TYPE = 'TestCapabilityBasedCredential1'

  const claimCap = await bob.claimCapability(
    gov as any, CRED_TYPE, {
    description: 'Test capability 1',
    info: 'Info for capability 1'
  })

  const claimBundle = await charly.signCapability(claimCap)

  await bob.storeCapability(claimBundle)

  const aliceClaim = await alice.claimCapabilityCreds(
    CRED_TYPE,
    [{
      description: 'Alice cred',
      info: 'Capability based cred for Alice'
    }]
  )

  const bobOffer = await bob.offerCapabilityCreds(aliceClaim)

  await alice.storeCapabilityCreds(bobOffer)

  const danCredRequest = await dan.requestCreds(CRED_TYPE)
  const aliceCreds = await alice.provideCredsByCaps(danCredRequest)
  const result = await dan.validateResponse<Util.TestCredential>(aliceCreds)

  console.log(result ? 'Alice credentials are OK' : 'Alice credentials a broken')
  if (!result) {
    console.log(aliceCreds)
  }
})()