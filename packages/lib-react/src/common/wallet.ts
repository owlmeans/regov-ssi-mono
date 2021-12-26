import { Dispatch, SetStateAction } from "react"

import { EncryptedStore, WalletWrapper } from "@owlmeans/regov-ssi-core"


export const createWalletHandler = (): WalletHandler => {
  const _handler: WalletHandler = {
    wallet: undefined,

    stores: {},

    observers: [],

    observe: <T>(
      setState: Dispatch<SetStateAction<T>>,
      transformer: HandlerObserverTransformer<T>
    ) => {
      const _observer = () => {
        const transformed = transformer(_handler.wallet)
        // console.log('transformed', transformed)
        setState(transformed)
      }
      _handler.observers.push(_observer)
      const idx = _handler.observers.length - 1

      return () => {
        // console.log('Unregister transformer')
        delete _handler.observers[idx]
      }
    },

    notify: () => {
      // console.log('Notify observers', _handler.observers.length)
      _handler.observers.forEach(observer => observer && observer())
    },

    loadStore: async (loader) => {
      const prev = _handler.wallet
      _handler.wallet = await loader(_handler)

      _handler.notify()

      return prev
    }
  }

  return _handler
}


export type WalletHandler = {
  wallet: WalletWrapper | undefined,

  stores: { [key: string]: EncryptedStore },

  observers: HandlerObserver[]

  notify: () => void

  observe: <T>(
    setState: Dispatch<SetStateAction<T>>,
    transformer: HandlerObserverTransformer<T>
  ) => () => void

  loadStore: (loader: StoreLoader) => Promise<WalletWrapper | undefined>
}

export type StoreLoader = (hanlder: WalletHandler) => Promise<WalletWrapper | undefined>

export type HandlerObserver = () => void

export type ObserverTransformerOption<
  T extends {} = {},
  Props extends {} = {}
  > = (wallet: WalletWrapper | undefined, props?: Props) => T

export type HandlerObserverTransformer<T> = (wallet: WalletWrapper | undefined) => T
