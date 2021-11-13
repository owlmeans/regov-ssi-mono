require('dotenv').config()

import { TestUtil as Util } from './utils/wallet'

import util from 'util'
import { capabilityVerifierHelper } from '..';
import { identityHelper } from '@owlmeans/regov-ssi-agent';
util.inspect.defaultOptions.depth = 8;

/**
 * @TODO It looks like we need to start developing test
 * cases and bundle helpers based on them.
 * Case 1: 
 * 1. Charly issue Fred an orgnaization capability.
 * 2. Fred provides Bob a memberhip capability. 
 * 3. Bob signs a membership credentail to Alice. 
 * 4. Dan trusts Charly. 
 * 5. Alice shows the credential to Dan. 
 * 6. Dan aknowledge credential as trusted.
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

  await charly.selfIssueGovernance()

  await bob.trustIdentity(charlyIdentity)
  await alice.trustIdentity(charlyIdentity)
  await dan.trustIdentity(charlyIdentity)
  await fred.trustIdentity(charlyIdentity)

  console.log('Everybody trusts Charly')

  const requestRootGov = await fred.requestGovernance()

  console.log('Chalry provides his governance credentials to Fred')

  const rootGov = await charly.responseGovernance(requestRootGov)

  const rootGovVer = await capabilityVerifierHelper(fred.wallet).response().verify(rootGov)

  console.log('Root governcnace of Charly is verified by Fred', rootGovVer)
  if (!rootGovVer) {
    console.log(rootGov)
  }

  const frediesClaim = await fred.claimOrganization('Fredies')

  console.log('Fred claimed organization capabilities')

  const frediesOffer = await charly.signCapability(frediesClaim)

  console.log('Charly signed and offer orgnaization capabilties')

  await fred.storeCapability(frediesOffer)

  console.log('Fred stored capabilities offered by Charly')

  console.log('Bob tries to request Capability from Fred')

  const claimCap = await bob.claimCapability({
    name: 'Organization 1 - Membership offer capability',
    description: 'Allows to provide Ortanization 1 membership'
  })

  console.log({
    'Charly ID': identityHelper(charly.wallet).getIdentity().identity.id,
    'Fred ID': identityHelper(fred.wallet).getIdentity().identity.id,
    'Bob ID': identityHelper(bob.wallet).getIdentity().identity.id,
    'Gov Capability': rootGov.verifiableCredential[1].id,
    'Claim': {
      Id: claimCap.verifiableCredential[1].credentialSubject.data.credential.id,
    }
  })

  console.log('Fred signs capability for Bob')

  const capOffer = await fred.signCapability<Util.MembershipDoc>(
    claimCap, Util.ORGANIZATION_CAPABILITY_TYPE,
    {
      organization: frediesOffer.verifiableCredential[1].credentialSubject
        .data.credential.credentialSubject.data.name,
      organziationDid: frediesOffer.verifiableCredential[1].credentialSubject.did.id
    }
  )

  console.log('Bob stores capability provided by Charly')

  await bob.storeCapability(capOffer)

  console.log('Alice claims capability based credentials from Bob')

  const aliceClaim = await alice.claimCapabilityCreds(
    Util.MEMBERSHIP_CREDENTIAL_TYPE, 'Volunteer'
  )

  console.log('Bob offers capability based credential to Alice')

  const bobOffer = await bob.offerCapabilityCreds(aliceClaim)

  console.log('Alice stores capability based credential provided by Bob')

  await alice.storeCapabilityCreds(bobOffer)

  console.log('Dan requests credential from Alice')
  const danCredRequest = await dan.requestCreds(Util.MEMBERSHIP_CREDENTIAL_TYPE)

  console.log('Alice provides capability based credentials to Dan')
  const aliceCreds = await alice.provideCredsByCaps(danCredRequest)

  console.log('Dan verifies credentials provided by Alice')
  const result = await dan.validateResponse<Util.MembershipCredential>(aliceCreds)

  console.log(result ? 'Alice credentials are OK' : 'Alice credentials a broken')
})()
