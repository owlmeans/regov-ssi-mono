require('dotenv').config()

import { TestUtil as Util } from './utils/wallet'

import util from 'util'
import { REGISTRY_SECTION_OWN, REGISTRY_SECTION_PEER, REGISTRY_TYPE_IDENTITIES } from '..'
util.inspect.defaultOptions.depth = 8


const _test = async () => {
  const alice = await Util.Wallet.setup('alice')
  const bob = await Util.Wallet.setup('bob')
  const charly = await Util.Wallet.setup('charly')

  await alice.produceIdentity()
  await bob.produceIdentity()
  await charly.produceIdentity()

  /**
   * @Case 1
   * 1. Charly provide his identity to Bob
   * 2. Alice claims a document from Charly
   * 3. Charly signs the document
   * 4. Charly offers the signed document to Alice
   * 5. Alice confirms the signed document (Claim should be cleaned up) <- @PROCEED We are here
   * 6. Bob requests the signed document from Alice by type and issuer
   * 7. Alice provides the requested document to Bob
   * 8. Bob verifies the document (Request should be cleaned up)
   */
  const govRequst = await bob.requestIdentity()
  const reqValidation = await charly.validateRequest(govRequst)
  console.log('GOV REQUEST VALIDATION', reqValidation)
  if (!reqValidation) {
    return
  }
  const govResponse = await charly.provideIdentity(govRequst)
  const [resValidation] = await bob.validateIdentityResponse(govResponse)
  console.log('GOV RESPONSE VALIDATION', resValidation)
  if (!resValidation) {
    return
  }
  try {
    await bob.trustIdentity(govResponse)
  } catch (e) {
    console.log(e)
    return
  }
  console.log(
    'GOV (CHARLY) IS TRUSTED BY VERIFIER (BOB)',
    // bob.wallet.did.registry.peer.dids,
    // bob.wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).registry.credentials[REGISTRY_SECTION_PEER]
  )
  const claim = await alice.claimTestDoc([
    {
      key: 'testdoc1',
      comment: 'nice doc for alice'
    },
    {
      id: 'testdoc2',
      description: 'not very nice doc for alice'
    }
  ])

  const { 
    result: claimCheck,
    claims: reqClaims,
    entity: aliceReqEntity 
  } = await charly.unbundleClaim(claim)

  if (claimCheck) {
    console.log('CHARLY RECEIVED CLAIM FROM ALICE')
  } else {
    console.log('CLAIM IS BROKEN', claim, aliceReqEntity)
    return 
  }

  const offer = await charly.signClaims(reqClaims)

  /**
   * @PROCEED
   * @TODO We are here and we need to make alice be able to accept documents
   * from untrusted issuer.
   * The option is to make Alice trust Charly before accept documents from him...
   * 
   * The last option looks more plosable. So on the SDK level it's a good idea
   * to support capability to accept offers from untrusted issuer. (Probably)
   * But we will use the case when the offerer should be trusted to accept documents
   * from him or her.
   */
  const {result, offers, entity: issuerEntity} = await alice.unbundleOffer(offer)

  if (result) {
    console.log('ALICE IS READY TO ACCEPT OFFER FROM CHARLY')
  } else {
    console.log('OFFER IS BROKEN', offer, issuerEntity)
    return 
  }

  /**
   * @TODO Should we support this case in general? Why Alice send documents
   * to Bob without request by Bob?
   * 
   * @Given Case 2
   * 6. Alice provides the signed document to Bob
   * 7. Bob verifies the document (Request should be cleaned up)
   */
}

_test()
