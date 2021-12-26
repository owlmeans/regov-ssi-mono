
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
          return store && store.hasOwnProperty('alias') ? { ...stores, [store.alias]: store } : stores
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
      console.log('STORE COMMITS')
      const promises = Object.entries(handler.stores).map(
        async ([alias, store]) => {
          if (handler.wallet && handler.wallet.store.alias === alias) {
            return null
          }
          if (_commited.includes(alias)) {
            return null
          }
          
          console.log(`::: commit ${alias}`)

          _commited.push(alias)
          return storage.setItem(alias, JSON.stringify(store))
        }
      )
      if (handler.wallet) {
        _commited.push(handler.wallet.store.alias)
        promises.push(handler.wallet.export().then(
          value => {
            console.log(`::: wallet commit ${value.alias}`)
            handler.stores[value.alias] = value
            return storage.setItem(
              value.alias, JSON.stringify(value)
            )
          }
        ))
      }

      return Promise.all(promises)
    },

    commitAsync: () => {
      _helper.commit().catch(e => console.log(e))
    }
  }

  return _helper
}