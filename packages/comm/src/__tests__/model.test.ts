import 'dotenv/config'
import { buildWalletWrapper, nodeCryptoHelper } from "@owlmeans/regov-ssi-core"
import { createDebugChannel } from "../channel/debug"
import { buildDidCommHelper } from "../model"
import { DIDCommConnectMeta, DIDCommHelper, DIDCommListner } from "../types"
import { fillWallet } from '../test/fill-wallet'


const config = {
  prefix: process.env.DID_PREFIX,
  defaultSchema: process.env.DID_SCHEMA,
  didSchemaPath: process.env.DID_SCHEMA_PATH,
}

describe('Comm model', () => {

  it('opens connection', async () => {
    const aliceWallet = await buildWalletWrapper(
      { crypto: nodeCryptoHelper }, '11111111', { alias: 'alice', name: 'Alice' }, config
    )

    const bobWallet = await buildWalletWrapper(
      { crypto: nodeCryptoHelper }, '11111111', { alias: 'bob', name: 'Bob' }, config
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

    await fillWallet(aliceWallet)
    await fillWallet(bobWallet)

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