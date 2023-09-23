import { CommConnectionStatusHandler } from '@owlmeans/regov-comm'
import { IntegratedWalletPlugin, UneregisterIntegratedWalletPlugin } from '@owlmeans/regov-lib-react'
import { REGISTRY_SECTION_PEER } from '@owlmeans/regov-ssi-core'
import { REGISTRY_TYPE_INBOX } from '../../types'
import { handleIncommingCommDocuments } from '../../utils'

let globalStatusHandle: CommConnectionStatusHandler | undefined

export const pluginIntegratedWalletKickoff: IntegratedWalletPlugin = ({
  handler, setInboxCount
}) => {
  if (!handler.wallet) {
    return
  }

  const registry = handler.wallet.getRegistry(REGISTRY_TYPE_INBOX)
  const inboxCount = registry.registry.credentials[REGISTRY_SECTION_PEER].length
  setInboxCount && setInboxCount(inboxCount)

  const updateInbox = () => {
    setInboxCount && setInboxCount(registry.registry.credentials[REGISTRY_SECTION_PEER].length)
  }

  setInboxCount && handler.observers.push(updateInbox)

  return () => {
    const idx = handler.observers.findIndex((ob) => ob === updateInbox)
    idx > -1 && handler.observers.splice(idx, 1)
  }
}

export const pluginIntegratedWalletInbox: IntegratedWalletPlugin = ({
  isHandlerPassed, handler, extensions, isUnregisterSet, setInboxCount
}) => {
  let unregister: UneregisterIntegratedWalletPlugin | undefined
  if (isHandlerPassed && !globalStatusHandle) {
    globalStatusHandle = handleIncommingCommDocuments(handler, extensions?.registry)
  } else if (!isHandlerPassed && !isUnregisterSet) {
    const handle = handleIncommingCommDocuments(handler, extensions?.registry)
    unregister = () => {
      handle?.defaultListener && handle.helper?.removeListener(handle.defaultListener)
    }
  }
  if (!handler.wallet) {
    return;
  }

  const registry = handler.wallet.getRegistry(REGISTRY_TYPE_INBOX)
  const inboxCount = registry.registry.credentials[REGISTRY_SECTION_PEER].length
  setInboxCount && setInboxCount(inboxCount)

  setInboxCount && handler.observers.push(() => {
    setInboxCount && setInboxCount(registry.registry.credentials[REGISTRY_SECTION_PEER].length)
  })

  return unregister
}
