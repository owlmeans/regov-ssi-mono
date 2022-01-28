
import { Config, WalletHandler } from '@owlmeans/regov-lib-react'
import { EncryptedStore } from '@owlmeans/regov-ssi-core'
import * as localforage from 'localforage'


export const buildStorageHelper = (
  handler: WalletHandler,
  config: Config
) => {
  const storage = localforage.createInstance({
    driver: localforage.INDEXEDDB,
    name: config.code,
    storeName: `${config.code}.storage`
  })

  const _commited: string[] = []

  let _obvserIdx = -1

  const _helper = {
    init: async () => {
      if (_obvserIdx > -1) {
        return
      }
      const storeList = await storage.keys()
      handler.stores = (await Promise.all(storeList.map(
        key => storage.getItem<string>(key)
      ))).map(
        store => store && JSON.parse(store) as EncryptedStore
      ).reduce(
        (stores, store) => {
          return store && store.hasOwnProperty('alias') && !store.toRemove
            ? { ...stores, [store.alias]: store } : stores
        }, {}
      )

      handler.observers.push(() => {
        _helper.commitAsync()
      })
      _obvserIdx = handler.observers.length - 1
    },

    touch: (alias: string) => {
      const idx = _commited.findIndex(_alias => _alias === alias)
      if (idx > -1) {
        _commited.splice(idx, 1)
      }
    },

    detach: () => {
      delete handler.observers[_obvserIdx]
    },

    commit: async () => {
      console.info('STORE COMMITS')

      let promises: Promise<string | null[] | null>[] = []

      Object.entries(handler.stores).map(
        ([alias, store]) => {
          if (store.toRemove) {
            console.info(`::: remove ${alias}`)
            promises.push(storage.removeItem(alias).then(_ => null))
            delete handler.stores[alias]
            _helper.touch(alias)
          }
        }
      )

      promises = [...promises, ...Object.entries(handler.stores).map(
        async ([alias, store]) => {
          if (handler.wallet && handler.wallet.store.alias === alias) {
            return null
          }
          if (_commited.includes(alias)) {
            return null
          }

          console.info(`::: commit ${alias}`)

          store.toRemove = false

          _commited.push(alias)
          return storage.setItem(alias, JSON.stringify(store))
        }
      )]

      if (handler.wallet) {
        _commited.push(handler.wallet.store.alias)
        promises.push(handler.wallet.export().then(
          value => {
            console.info(`::: wallet commit ${value.alias}`)
            handler.stores[value.alias] = value
            value.toRemove = false
            return storage.setItem(
              value.alias, JSON.stringify(value)
            )
          }
        ))
      }

      promises.push(storage.keys().then(
        keys => Promise.all(keys.map(
          async alias => {
            if (!handler.stores[alias]) {
              console.info(`::: cleanup ${alias}`)
              await storage.removeItem(alias)
              _helper.touch(alias)
            }
            return null
          }
        ))
      ))

      return Promise.all(promises)
    },

    commitAsync: () => {
      _helper.commit().catch(e => console.error(e))
    }
  }

  return _helper
}