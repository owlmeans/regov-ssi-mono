require('dotenv').config()

import { TestUtil as Util } from './utils/wallet'

import util from 'util'
import { REGISTRY_TYPE_IDENTITIES } from '@owlmeans/regov-ssi-core';
util.inspect.defaultOptions.depth = 8;

/**
 * @TODO It looks like we need to start developing test
 * cases and bundle helpers based on them.
 * Case 1: 
 * 1. Charly issue Fred a governance capability.
 * 2. Fred provides Bob a capability. 
 * 3. Bob signs a capability based credentail to Alice. 
 * 4. Dan trusts Charly. 
 * 5. Alice shows the credential to Dan. 
 * 6. Dan aknowledge credential as trusted.
 * 
 * Case 2: The same. But Bob hires Emma and delegate capability to her.
 * Emma signs credential istead of Bob. But Dan still aknowledges it.
 */
(async () => {
  const alice = await Util.Wallet.setup('alice')
  const bob = await Util.Wallet.setup('bob')
  const charly = await Util.Wallet.setup('charly')
  const dan = await Util.Wallet.setup('dan')
  const fred = await Util.Wallet.setup('fred')

  await alice.produceIdentity()
  await bob.produceIdentity()
  await charly.produceIdentity()
  await dan.produceIdentity()
  await fred.produceIdentity()

  const charlyIdentity = await charly.provideIdentity()

  await charly.selfIssueGovernance(charlyIdentity)

  await bob.trustIdentity(charlyIdentity)
  await alice.trustIdentity(charlyIdentity)
  await dan.trustIdentity(charlyIdentity)
  await fred.trustIdentity(charlyIdentity)

  console.log('Everybody trusts Charly')

  // const requestRootGov = await fred.requestGovernance()

  // console.log('Chalry provides his governance credentials to Fred')

  // const rootGov = await charly.responseGovernance(requestRootGov)

  // await fred.claimGovernance(rootGov)

  /**
   * @PROCEED
   * @TODO Make Bob request governance from Fred.
   * 1. Charly offer governance to Fred.
   * 2. Governance has capability limits.
   * 3. Bob requests gavernance from Fred to claim capability
   * 4. Fred provides capability to Bob instead of Charly
   * 
   * 5. When Dan verifies Alice's credentials, he checks if 
   * the capability is allowed by Fred's governance
   * 5.1. Credentials should be included to the chain
   * alongside credentials
   * 5.2. Refactor chain building and verification in a direct
   * sequenc (the chain itself can be ordered a random way???)
   * 5.3. Make sure that the chain verification implies the 
   * checks of previous credential in chain
   */

  const requestGov = await bob.requestGovernance()

  console.log('Charly provides his governance credentials to Bob')

  const gov = await charly.responseGovernance(requestGov)

  console.log('Bob tries to request Capability from Charly')

  const claimCap = await bob.claimCapability(
    gov, Util.CRED_TYPE, {
    description: 'Test capability 1',
    info: 'Info for capability 1'
  })

  console.log({
    'Charly ID': charly.wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
      .getCredential()?.credential.id,
    'Bob ID': bob.wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
      .getCredential()?.credential.id,
    'Gov Capability': gov.verifiableCredential[1].id,
    'Claim': {
      Id: claimCap.verifiableCredential[1].credentialSubject.data.credential.id,
      Source: claimCap.verifiableCredential[1].credentialSubject.data.credential.credentialSubject.source.id,
      Root: claimCap.verifiableCredential[1].credentialSubject.data.credential.credentialSubject.root
    }
  })

  console.log('Charly signs capability for Bob')

  const claimBundle = await charly.signCapability(claimCap)

  console.log('Bob stores capability provided by Charly')

  await bob.storeCapability(claimBundle)

  console.log('Alice claims capability based credentials from Bob')

  const aliceClaim = await alice.claimCapabilityCreds(
    Util.CRED_TYPE,
    [{
      description: 'Alice cred',
      info: 'Capability based cred for Alice'
    }]
  )

  console.log('Bob offers capability based credential to Alice')

  const bobOffer = await bob.offerCapabilityCreds(aliceClaim)

  console.log('Alice stores capability based credential provided by Bob')

  await alice.storeCapabilityCreds(bobOffer)

  console.log('Dan requests credential from Alice')
  const danCredRequest = await dan.requestCreds(Util.CRED_TYPE)

  console.log('Alice provides capability based credentials to Dan')
  const aliceCreds = await alice.provideCredsByCaps(danCredRequest)

  console.log('Dan verifies credentials provided by Alice')
  const result = await dan.validateResponse<Util.TestCredential>(aliceCreds)

  console.log(result ? 'Alice credentials are OK' : 'Alice credentials a broken')
})()
