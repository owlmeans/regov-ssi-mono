import 'dotenv/config'

import { buildWalletWrapper, nodeCryptoHelper } from '@owlmeans/regov-ssi-core'
import { createWSChannel } from '../channel'
import { createWSClient } from '../client'
import { buildDidCommHelper } from '../model'
import { fillWallet } from '../test/fill-wallet'
import { DIDCommConnectMeta, DIDCommHelper, DIDCommListner } from '../types'

import util from 'util'
util.inspect.defaultOptions.depth = 8


const config = {
  prefix: process.env.DID_PREFIX,
  defaultSchema: process.env.DID_SCHEMA,
  didSchemaPath: process.env.DID_SCHEMA_PATH,
}

describe('WS Server', () => {
  it.skip('receives', async () => {
    const client1 = await createWSClient({
      timeout: parseInt(process.env.RECEIVE_MESSAGE_TIMEOUT || '30'),
      server: process.env.CLIENT_WS as string
    })
    const client2 = await createWSClient({
      timeout: parseInt(process.env.RECEIVE_MESSAGE_TIMEOUT || '30'),
      server: process.env.CLIENT_WS as string
    })

    await client1.send('did:' + process.env.DID_PREFIX + ':zzz')
    await client2.send('did:' + process.env.DID_PREFIX + ':yyy')
    await client1.close()
    await client2.close()
  })

  it('works with wallets', async () => {
    const aliceWallet = await buildWalletWrapper(
      { crypto: nodeCryptoHelper }, '11111111', { alias: 'alice', name: 'Alice' }, config
    )

    const bobWallet = await buildWalletWrapper(
      { crypto: nodeCryptoHelper }, '11111111', { alias: 'bob', name: 'Bob' }, config
    )

    const aliceChannel = await createWSChannel({
      timeout: parseInt(process.env.RECEIVE_MESSAGE_TIMEOUT || '30'),
      server: process.env.CLIENT_WS as string
    })
    const bobChannel = await createWSChannel({
      timeout: parseInt(process.env.RECEIVE_MESSAGE_TIMEOUT || '30'),
      server: process.env.CLIENT_WS as string
    })

    const aliceComm = buildDidCommHelper(aliceWallet)
    const bobComm = buildDidCommHelper(bobWallet)

    await aliceComm.addChannel(aliceChannel)
    await bobComm.addChannel(bobChannel)
    const bobListener = createDebugListener(() => { })
    // jest.spyOn(bobListener, 'receive')
    bobListener.receive = jest.fn()
    await bobComm.addListener(bobListener)

    await fillWallet(aliceWallet)
    await fillWallet(bobWallet)

    await aliceComm.listen(aliceWallet)
    await bobComm.listen(bobWallet)

    const recipientId = bobWallet.getIdentity()?.credential.id
    if (!recipientId) {
      throw 'no recipient id'
    }

    const sender = aliceWallet.getIdentity()?.credential.holder
    if (!sender || !aliceWallet.did.helper().isDIDDocument(sender)) {
      throw 'no sender'
    }

    let resolve: CallableFunction
    const promise = new Promise((_resolve) => {
      resolve = _resolve
    })

    await aliceComm.addListener(createDebugListener(async (connection: DIDCommConnectMeta) => {
      console.log('ESTABLISHED!')
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

      setTimeout(() => resolve(), 10000)
    }))

    console.log(aliceWallet.store.alias + ': ' + sender.id)
    console.log(bobWallet.store.alias + ': ' + recipientId)
    await aliceComm.connect({ recipientId, sender })

    await promise

    await aliceChannel.close()
    await bobChannel.close()

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