
import { Store, WalletContext, BasicWalletWrapper, } from 'wallet/types'

import { generateEmptyWallet, produceAllMethods } from './methods'

export * from './types'


export const produceWalletWrapperBuilder =
  (store: Store, context: WalletContext) => async (alias: string): Promise<BasicWalletWrapper> => {
    const wallet = await generateEmptyWallet(alias, store, context)

    return {
      ...wallet,
      ...produceAllMethods(alias, store, wallet, context)
    }
  }


