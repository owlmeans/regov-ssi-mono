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

  console.log('Everybody trusts Charly')

  const requestGov = await bob.requestGovernance()

  console.log('Charly provides his governance credentials to Bob')

  const gov = await charly.responseGovernance(requestGov)

  console.log('Bob tries to request Capability from Charly')

  const CRED_TYPE = 'TestCapabilityBasedCredential1'

  const claimCap = await bob.claimCapability(
    gov as any, CRED_TYPE, {
    description: 'Test capability 1',
    info: 'Info for capability 1'
  })

  console.log('Charly signs capability for Bob')

  const claimBundle = await charly.signCapability(claimCap)

  console.log('Bob stores capability provided by charly')

  await bob.storeCapability(claimBundle)

  console.log('Alice claims capability based credentials from Bob')

  const aliceClaim = await alice.claimCapabilityCreds(
    CRED_TYPE,
    [{
      description: 'Alice cred',
      info: 'Capability based cred for Alice'
    }]
  )

  console.log('Bob offers capability based credential to Alice')

  const bobOffer = await bob.offerCapabilityCreds(aliceClaim)

  console.log('Alice stores capability proved by Bob')

  await alice.storeCapabilityCreds(bobOffer)

  console.log('Dan requests credential from Alice')
  const danCredRequest = await dan.requestCreds(CRED_TYPE)

  console.log('Alice provides capability based credentials to Dan')
  const aliceCreds = await alice.provideCredsByCaps(danCredRequest)

  console.log('Dan verifies credentials provided by Alice')
  const result = await dan.validateResponse<Util.TestCredential>(aliceCreds)

  console.log(result ? 'Alice credentials are OK' : 'Alice credentials a broken')
  if (!result) {
    console.log(aliceCreds)
  }
})()