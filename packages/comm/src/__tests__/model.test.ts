/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import 'dotenv/config'
import { buildWalletWrapper, nodeCryptoHelper, WalletWrapper } from "@owlmeans/regov-ssi-core"
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
    const bobListener = createDebugListener(bobWallet, () => {
      console.log(':= bob established')
    })
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

    await aliceComm.addListener(createDebugListener(aliceWallet, async (connection: DIDCommConnectMeta) => {
      console.log(':= alice established')
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
      console.log('before send -')
      await aliceComm.send(pres, connection)
    }))
    await aliceComm.connect({ recipientId, sender })

    await new Promise(resolve => setTimeout(resolve, 1000))

    expect(bobListener.receive).toBeCalled()
  })
})

export const createDebugListener = (wallet: WalletWrapper, callback: CallableFunction): DIDCommListner => {
  let _comm: DIDCommHelper | undefined

  const _listener: DIDCommListner = {
    init: async (didComm) => {
      _comm = didComm
    },

    accept: async (connection) => {
      console.log(`accept - ${wallet.store.alias}`)
      await _comm?.accept(connection)
    },

    established: async (connection) => {
      console.log(`established - ${wallet.store.alias}`)
      await callback(connection)
    },

    receive: async (connection, doc) => {
      console.log('SUCCESSFULLY RECEIVED')
      console.log(connection)
      console.log(doc)
    }
  }

  return _listener
}