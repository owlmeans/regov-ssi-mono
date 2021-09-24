require('dotenv').config()

import { governanceCredentialHelper } from '../governance/credential'
import { TestUtil as Util } from './utils/wallet'

import util from 'util'
import { ClaimCredential, ClaimSubject, ClaimDocument, ClaimSubjectExtension, holderCredentialHelper, issuerCredentialHelper, OfferCredential, OfferSubject } from '@owlmeans/regov-ssi-agent';
import { CapabilityCredential, CapabilityDocument, CapabilityExtension, CapabilitySubject, ClaimCapability, OfferCapability, OfferCapabilityExtension } from '../governance/types';
import { holderGovernanceVisitor } from '../governance/holder';
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

  const identity = charlyIdentity.verifiableCredential[0].credentialSubject.data.identity

  await bob.trustIdentity(charlyIdentity)

  const claim = await governanceCredentialHelper(charly.wallet).claimGovernance(
    identity, { name: 'Governance Claim' }
  )

  const offer = await governanceCredentialHelper(charly.wallet).offer(claim)

  const offerBundle = await issuerCredentialHelper(charly.wallet)
    .bundle<ClaimCapability, OfferCapability>().build([offer])

  await holderCredentialHelper<
    CapabilityDocument,
    CapabilityExtension,
    CapabilityCredential,
    OfferCapabilityExtension
  >(
    charly.wallet, holderGovernanceVisitor(charly.wallet)
  ).bundle().store(offerBundle)

  console.log(offer)
})()