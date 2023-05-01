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

import {
  buildWalletWrapper, DEFAULT_WALLET_ALIAS, nodeCryptoHelper, WalletHandler, WalletWrapper
} from '@owlmeans/regov-ssi-core'
import express, { Router, Request, Response } from 'express'
import bodyParser from 'body-parser'
import { ServerExtensionRegistry } from '../extension'
import { ServerStore } from '../store'
import { readPeerVCs } from './peer-reader'
import {
  APP_EVENT_PRODUCE_IDENTITY, DEFAULT_STORE_PASSWORD, ERROR_NO_WALLET, RegovServerApp,
  ServerAppConfig,
  ServerEventProduceIdentityParams
} from './types'
import { reviveJson } from '../utils'


const _bindings = new WeakMap<Request, RegovServerApp>()

export const buildApp = async (
  { router, handler, store, config, extensions }: BuildAppParams
): Promise<RegovServerApp> => {

  await store.init(handler)

  const stored = handler.stores[config.wallet?.alias || DEFAULT_WALLET_ALIAS]
  if (stored) {
    await handler.loadStore(async () => {
      return await buildWalletWrapper(
        { crypto: nodeCryptoHelper, extensions: extensions.registry },
        config.wallet?.password || DEFAULT_STORE_PASSWORD,
        stored,
        {
          prefix: config.walletConfig.prefix,
          defaultSchema: config.walletConfig.defaultSchema,
          didSchemaPath: config.walletConfig.didSchemaPath
        }
      )
    })
  } else {
    await handler.loadStore(async () => {
      const wallet = await buildWalletWrapper(
        { crypto: nodeCryptoHelper, extensions: extensions.registry },
        config.wallet?.password || DEFAULT_STORE_PASSWORD,
        {
          alias: config.wallet?.alias || DEFAULT_WALLET_ALIAS,
          name: config.wallet?.alias || DEFAULT_WALLET_ALIAS
        },
        {
          prefix: config.walletConfig.prefix,
          defaultSchema: config.walletConfig.defaultSchema,
          didSchemaPath: config.walletConfig.didSchemaPath
        }
      )
      handler.stores[wallet.store.alias] = await wallet.export()

      return wallet
    })

    if (!handler.wallet) {
      throw ERROR_NO_WALLET
    }

    await extensions.triggerEvent<ServerEventProduceIdentityParams>(
      handler.wallet, APP_EVENT_PRODUCE_IDENTITY, { extensions: extensions.registry }
    )

    handler.notify()
  }

  if (handler.wallet && config.peerVCs) {
    await readPeerVCs(handler.wallet, config)
    handler.notify()
  }

  const _app: RegovServerApp = {
    handler,

    extensions,

    app: express(),

    start: () => {
      extensions.serverExtensions.forEach(
        ext => {
          const router = ext.produceRouter()
          router && _app.app.use(router)
        }
      )
      _app.app.listen(config.port, () => {
        console.log(`Server started on port ${config.port}.`)
      })
    }
  }

  _app.app.use(bodyParser.json({
    reviver: reviveJson
  }))
  // _app.app.use(bodyParser.urlencoded({ extended: true }))

  _app.app.use((req, res, next) => {
    _bindings.set(req, _app)
    res.on('finish', () => _bindings.delete(req))
    next()
  })

  _app.app.use(router)

  return _app
}

export const getAppContext = (req: Request): RegovServerApp => {
  return _bindings.get(req) as RegovServerApp
}

export const assertWallet = (req: Request, res: Response): WalletWrapper => {
  const app = getAppContext(req)
  if (app.handler.wallet) {
    return app.handler.wallet
  }
  res.status(503).send(ERROR_NO_WALLET)
  throw ERROR_NO_WALLET
}

export type BuildAppParams = {
  store: ServerStore
  handler: WalletHandler
  router: Router
  config: ServerAppConfig
  extensions: ServerExtensionRegistry
} 