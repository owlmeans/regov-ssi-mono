import {
  buildWalletWrapper, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION, DIDPURPOSE_VERIFICATION,
  nodeCryptoHelper, REGISTRY_SECTION_OWN, REGISTRY_TYPE_IDENTITIES, VERIFICATION_KEY_HOLDER, WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { createDebugServer } from "../debug/server"
import { buildDidCommHelper } from "../model"


const config = {
  prefix: 'exm',
  defaultSchema: 'https://owlmeans.com/schemas',
  didSchemaPath: 'did-schema.json',
}

describe('Comm model', () => {

  it('opens connection', async () => {
    const aliceWallet = await buildWalletWrapper(
      nodeCryptoHelper, '11111111', { alias: 'alice', name: 'Alice' }, config
    )

    const bobWallet = await buildWalletWrapper(
      nodeCryptoHelper, '11111111', { alias: 'bob', name: 'Bob' }, config
    )

    const aliceServer = createDebugServer()
    const bobServer = createDebugServer()

    const aliceComm = buildDidCommHelper(aliceWallet)
    const bobComm = buildDidCommHelper(bobWallet)

    await aliceComm.addChannel(aliceServer)
    await bobComm.addChannel(bobServer)

    await _produceCred(aliceWallet)
    await _produceCred(bobWallet)

    const recipientId = bobWallet.getIdentity()?.credential.id
    if (!recipientId) {
      throw 'no recipient id'
    }

    const sender = aliceWallet.getIdentity()?.credential.issuer
    if (!sender || !aliceWallet.did.helper().isDIDDocument(sender)) {
      console.log(sender)
      throw 'no sender'
    }

    await aliceComm.connect({ recipientId, sender })
  })
})


const _produceCred = async (wallet: WalletWrapper) => {
  const subject = {
    data: {
      '@type': 'TestCredentialSubjectDataType',
      worker: 'Valentin Michalych'
    }
  }
  const key = await wallet.ssi.keys.getCryptoKey()
  const didUnsigned = await wallet.ssi.did.helper().createDID(
    key,
    {
      data: JSON.stringify(subject),
      hash: true,
      purpose: [DIDPURPOSE_VERIFICATION, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION]
    }
  )

  const did = await wallet.ssi.did.helper().signDID(key, didUnsigned)

  const unsingnedCredentail = await wallet.ssi.buildCredential({
    id: did.id,
    type: ['VerifiableCredential', 'TestCredential'],
    holder: did,
    context: {
      '@version': 1.1,
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      exam: 'https://example.org/vc-schema#',
      data: {
        '@id': 'exam:data',
        '@type': '@id',
        '@context': {
          worker: { '@id': 'exam:worker', '@type': 'xsd:string' }
        }
      }
    },
    subject
  })

  const credentail = await wallet.ssi.signCredential(
    unsingnedCredentail, did, { keyId: VERIFICATION_KEY_HOLDER }
  )

  await wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).addCredential(credentail)
  wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).registry.rootCredential = credentail.id
}