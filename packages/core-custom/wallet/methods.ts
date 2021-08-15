import { SimpleThing, VCV1Type } from "@affinidi/vc-common"
import { KeyChainClaim } from "cryptowrapper/types"


import {
  _transformToCredentialsWallet,
  _transformToIdentityWallet,
  _transformToKeysWallet
} from "./builder"
import { produceWalletHolder } from "./holder"
import { produceWalletIssuer } from "./issuer"
import { produceWalletOperator } from "./opertor"

import {
  Store,
  Wallet,
  WalletContext,
  BASICWALLET_CREDENTIALS,
  BASICWALLET_IDENTITY,
  BASICWALLET_KEYS,
  ERROR_IDENTITY_EXISTS,
  ERROR_WALLET_EXISTS,
  ERROR_NO_STORE_PASSWORD,
  SubjectClaim,
  Identity,
  IDTYPE_SUBJECT,
  IDTYPE_SUBJECTS,
} from "./types"
import { produceWalletVerifier } from "./verifier"


export const produceAllMethods =
  (alias: string, store: Store, wallet: Wallet, context: WalletContext) => ({
    create: _produceCreateMethod(alias, store, wallet, context),
    open: _produceOpenMethod(alias, store, context),
    save: _produceSaveMethod(store, wallet, context),
    close: _produceCloseMethod(alias, store, context),
    forget: _produceForgetMethod(alias, store, context),
    getOperator: produceWalletOperator(wallet, context),
    getHolder: produceWalletHolder(wallet, context),
    getIssuer: produceWalletIssuer(wallet, context),
    getVerifier: produceWalletVerifier(wallet, context)
  })

export const generateEmptyWallet = async (alias: string, store: Store, context: WalletContext) => (
  {
    exists: await store.exists(BASICWALLET_IDENTITY, alias),
    alias,
    store,
    identity: await _transformToIdentityWallet({ didIndex: {}, aliasIndex: {} }, context),
    credentials: await _transformToCredentialsWallet({ didIndex: {}, aliasIndex: {} }, context),
    keys: await _transformToKeysWallet({ didIndex: {}, aliasIndex: {} }, context)
  }
)

const _produceCreateMethod =
  (alias: string, store: Store, wallet: Wallet, context: WalletContext) =>
    async (claim: KeyChainClaim = { empty: false }) => {
      const { identity, keys } = wallet
      if (!wallet.exists) {
        if (!identity.identity?.id) {
          if (!keys.keyChain.intialized) {
            keys.keyChain = await context.crypto.generateKeyChain(claim)
          }
          identity.identity = await context.produceIdentity(keys.keyChain.entityKey)
        } else {
          throw new Error(ERROR_IDENTITY_EXISTS)
        }
      } else {
        throw new Error(ERROR_WALLET_EXISTS)
      }

      const newWallet = { ...wallet, exists: true, identity, keys }

      return { ...newWallet, ...produceAllMethods(alias, store, newWallet, context) }
    }

const _produceOpenMethod =
  (alias: string, store: Store, context: WalletContext) =>
    async (password: string, safe: boolean = true) => {
      const newWallet = {
        exists: true,
        alias,
        store,
        ...(safe ? {} : { password }),
        identity: await _transformToIdentityWallet(
          await store.extract(BASICWALLET_IDENTITY, alias, password),
          context
        ),
        credentials: await _transformToCredentialsWallet(
          await store.extract(BASICWALLET_CREDENTIALS, alias, password),
          context
        ),
        keys: await _transformToKeysWallet(
          await store.extract(BASICWALLET_KEYS, alias, password),
          context
        )
      }

      return { ...newWallet, ...produceAllMethods(alias, store, newWallet, context) }
    }

const _produceSaveMethod =
  (store: Store, wallet: Wallet, context: WalletContext) =>
    async (password?: string) => {
      if (!password && !wallet.password) {
        throw new Error(ERROR_NO_STORE_PASSWORD)
      }
      const _password: string = password || wallet.password || ''

      const promises: Promise<void>[] = []

      promises.push(store.store(BASICWALLET_KEYS, {
        didIndex: wallet.keys.didIndex,
        aliasIndex: wallet.keys.aliasIndex,
        typeSpecificData: {
          intialized: wallet.keys.keyChain.intialized,
          mnemonic: wallet.keys.keyChain.mnemonic,
          seed: wallet.keys.keyChain.seed,
          entityKey: wallet.keys.keyChain.entityKey,
          nextEntityKey: wallet.keys.keyChain.nextEntityKey
        }
      }, wallet.alias, _password))

      promises.push(store.store(BASICWALLET_IDENTITY, {
        didIndex: wallet.identity.didIndex,
        aliasIndex: wallet.identity.aliasIndex,
        typeSpecificData: wallet.identity.identity
      }, wallet.alias, _password))

      promises.push(store.store(BASICWALLET_CREDENTIALS, {
        didIndex: wallet.credentials.didIndex,
        aliasIndex: wallet.credentials.aliasIndex
      }, wallet.alias, _password))

      if ((await Promise.all(promises)).includes(false)) {
        return false
      }

      return true
    }

const _produceForgetMethod =
  (alias: string, store: Store, context: WalletContext) =>
    async () => {
      const close = _produceCloseMethod(alias, store, context)
      await close()

      if ((await Promise.all([
        BASICWALLET_KEYS,
        BASICWALLET_IDENTITY,
        BASICWALLET_CREDENTIALS
      ].map(type => store.forget(type, alias)))).includes(false)) {
        return false
      }

      return true
    }

const _produceCloseMethod =
  (alias: string, store: Store, context: WalletContext) =>
    async () => {
      const wallet = await generateEmptyWallet(alias, store, context)

      return { ...wallet, ...produceAllMethods(alias, store, wallet, context) }
    }
