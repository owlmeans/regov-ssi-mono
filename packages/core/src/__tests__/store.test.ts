/**
 *  Copyright 2023 OwlMeans
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

import { nodeCryptoHelper, EncryptedStore, WalletWrapper, buildWalletWrapper, KEYCHAIN_DEFAULT_KEY } from "../index"
import util from 'util'
util.inspect.defaultOptions.depth = 6


describe('Wallet', () => {

  const _ctx: {
    seed: string
    wallet?: WalletWrapper
    store?: EncryptedStore
  } = {
    seed: 'CGETek79CLUkP9vB48Tnj7VEqiWTmD46RScExYGieiE2'
  }

  it('creates store', async () => {
    const wallet = _ctx.wallet = await buildWalletWrapper({ crypto: nodeCryptoHelper }, '11111111', {
      alias: 'current',
      name: 'Some name'
    }, { key: { seed: _ctx.seed } })

    expect(wallet.store.alias).toBe('current')
  })

  it('exports store', async () => {
    if (!_ctx.wallet) {
      throw new Error('No wallet from pervious test')
    }

    const store = _ctx.store = await _ctx.wallet.export('11111111')

    expect(store.alias).toBe('current')
  })

  it('imports store back', async () => {
    if (!_ctx.store) {
      throw new Error('No store from pervious test')
    }

    const newWallet = await buildWalletWrapper({ crypto: nodeCryptoHelper }, '11111111', _ctx.store)

    expect(newWallet.wallet).toMatchSnapshot({
      keyChain: {
        keys: {
          [KEYCHAIN_DEFAULT_KEY]: {
            seed: expect.any(String),
            rotations: [
              { private: expect.any(String) },
              {
                private: expect.any(String),
                public: expect.any(String)
              },
            ]
          }
        }
      }
    })
  })
})