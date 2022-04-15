import 'dotenv/config'
import {
  buildWalletWrapper, DIDPURPOSE_ASSERTION, DIDPURPOSE_AUTHENTICATION, DIDPURPOSE_VERIFICATION,
  nodeCryptoHelper, REGISTRY_TYPE_IDENTITIES, VERIFICATION_KEY_HOLDER, WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { createDebugChannel } from "../debug/channel"
import { commDidHelperBuilder } from "../did"
import { buildDidCommHelper } from "../model"
import { DIDCommConnectMeta, DIDCommHelper, DIDCommListner } from "../types"


const config = {
  prefix: process.env.DID_PREFIX,
  defaultSchema: process.env.DID_SCHEMA,
  didSchemaPath: process.env.DID_SCHEMA_PATH,
}

describe('Comm model', () => {

  it('opens connection', async () => {
    const aliceWallet = await buildWalletWrapper(
      nodeCryptoHelper, '11111111', { alias: 'alice', name: 'Alice' }, config
    )

    const bobWallet = await buildWalletWrapper(
      nodeCryptoHelper, '11111111', { alias: 'bob', name: 'Bob' }, config
    )

    const aliceServer = createDebugChannel()
    const bobServer = createDebugChannel()

    const aliceComm = buildDidCommHelper(aliceWallet)
    const bobComm = buildDidCommHelper(bobWallet)

    await aliceComm.addChannel(aliceServer)
    await bobComm.addChannel(bobServer)
    const bobListener = createDebugListener(() => { })
    bobListener.receive = jest.fn()
    await bobComm.addListener(bobListener)

    await _produceCred(aliceWallet)
    await _produceCred(bobWallet)

    const recipientId = bobWallet.getIdentity()?.credential.id
    if (!recipientId) {
      throw 'no recipient id'
    }

    const sender = aliceWallet.getIdentity()?.credential.issuer
    if (!sender || !aliceWallet.did.helper().isDIDDocument(sender)) {
      throw 'no sender'
    }

    let resolve: CallableFunction 
    const promise = new Promise((_resolve) => {
      resolve = _resolve
    })

    await aliceComm.addListener(createDebugListener(async (connection: DIDCommConnectMeta) => {
      const cred = aliceWallet.getIdentity()?.credential
      if (!cred) {
        throw new Error('No cred to send')
      }
      if (!cred.holder || !aliceWallet.did.helper().isDIDDocument(cred.holder)) {
        throw new Error('Holder isn\'t did')
      }
      const presUn = await aliceWallet.ssi.buildPresentation([cred], {
        holder: cred.holder, id: cred.id
      })
      const pres = await aliceWallet.ssi.signPresentation(presUn, cred.holder)
      await aliceComm.send(pres, connection)

      setTimeout(resolve, 250)
    }))
    await aliceComm.connect({ recipientId, sender })
    await promise

    expect(bobListener.receive).toBeCalled()
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

  const _didHelper = commDidHelperBuilder(wallet)

  const did = await wallet.ssi.did.helper().signDID(key, await _didHelper.addDIDAgreement(didUnsigned))

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

export const createDebugListener = (callback: CallableFunction): DIDCommListner => {
  let _comm: DIDCommHelper | undefined

  const _listener: DIDCommListner = {
    init: async (didComm) => {
      _comm = didComm
    },

    accept: async (connection) => {
      _comm?.accept(connection)
    },

    established: async (connection) => {
      callback(connection)
    },

    receive: async (connection, doc) => {
      console.log('SUCCESSFULLY RECEIVED')
      console.log(connection)
      console.log(doc)
    }
  }

  return _listener
}