
import { useState, ComponentProps, createContext, PropsWithChildren, useEffect } from 'react'

import { WalletWrapper, EncryptedStore, buildWalletWrapper } from 'metabelarusid-core'
import { webCryptoHelper } from 'metabelarusid-common'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from '../store/types'
import { DID_PREFIX } from './types'


const _walletRegistry: { [key: string]: WalletWrapper } = {}

const _forceUpdateRegistry: Function[] = []

export const WalletContext = createContext(undefined)

const connector = connect(({ store: { current } }: RootState, props) => ({
  alias: current,
  ...props
}))

export const WalletProvider =
  connector(
    ({ alias, children }: PropsWithChildren<ConnectedProps<typeof connector>>) => {
      const [_counter, setState] = useState(0)

      useEffect(() => {
        const idx = _forceUpdateRegistry.length
        _forceUpdateRegistry.push(() => setState(_counter + 1))

        return () => { _forceUpdateRegistry.splice(idx, 1) }
      })

      console.log(`Provide wallet ${_walletRegistry[alias]?.store?.alias}`)

      return <WalletContext.Provider value={_walletRegistry[alias]}>
        {children}
      </WalletContext.Provider>
    }
  )

export const WithWallet = WalletContext.Consumer

export const produceWalletContext =
  async (password: string, store: EncryptedStore = undefined) => {
    const result = _walletRegistry[store.alias] = await buildWalletWrapper(
      webCryptoHelper,
      password,
      store,
      { prefix: DID_PREFIX }
    )
    _forceUpdateRegistry.every(forceUpdate => forceUpdate())
    return result
  }

export const withWallet = (Com) =>
  (props: PropsWithChildren<any> | ComponentProps<any>) =>
    <WithWallet>
      {
        (wallet: WalletWrapper) =>
          props.children
            ? <Com {...props} wallet={wallet}>{props.children}</Com>
            : <Com {...props} wallet={wallet} />
      }
    </WithWallet>