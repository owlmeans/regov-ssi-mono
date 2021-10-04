require('dotenv').config()

import { TestUtil as Util } from './utils/wallet'

import util from 'util'
util.inspect.defaultOptions.depth = 8


const _test = async () => {
  const alice = await Util.Wallet.setup('alice')
  const bob = await Util.Wallet.setup('bob')
  const charly = await Util.Wallet.setup('charly')

  await alice.produceIdentity()
  await bob.produceIdentity()
  await charly.produceIdentity()

  /**
   * @CASE 1
   * 1. Charly provide his identity to Bob
   * 2. Alice claims a document from Charly
   * 3. Charly signs the document
   * 4. Charly offers the signed document to Alice
   * 5. Alice confirms the signed document (Claim should be cleaned up)
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

  try {
    await alice.trustIdentity(govResponse)
  } catch (e) {
    console.log(e)
    return
  }

  const {result, offers, entity: issuerEntity} = await alice.unbundleOffer(offer)

  if (result) {
    console.log('ALICE IS READY TO ACCEPT OFFER FROM CHARLY')
  } else {
    console.log('OFFER IS BROKEN', offer, issuerEntity)
    return 
  }

  await alice.storeOffer(offer)

  const requestCred = await bob.requestCreds()

  const validRequest = await alice.validateRequest(requestCred)
  if (validRequest) {
    console.log('BOB REQUESTED CREDS FROM ALICE - AND REQUEST IS OK')
  } else {
    console.log('BOB\'S REQUEST IS BROKEN')
    return
  }

  const responseCred = await alice.provideCreds(requestCred)

  console.log('ALICE SENT A RESPONSE TO BOB')

  const responseValid = await bob.validateResponse(responseCred)

  if (responseValid) {
    console.log('ALICE SENT TO BOB A VALID RESPONSE WITH CREDS', responseValid)
  } else {
    console.log('ALICE\'S RESPONSE IS BROKEN')
    return
  }
}

_test()
