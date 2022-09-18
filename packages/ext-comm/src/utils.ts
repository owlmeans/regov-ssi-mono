import {
  CommConnectionStatusHandler, InitCommEventParams, EVENT_INIT_CONNECTION
} from "@owlmeans/regov-comm"
import { useRegov } from "@owlmeans/regov-lib-react"
import { CredentialsRegistryWrapper, ExtensionRegistry, REGISTRY_SECTION_PEER, WalletHandler } from "@owlmeans/regov-ssi-core"
import { IncommingCrednetialSubject, IncommingMeta, IncommingPresentation, REGISTRY_TYPE_INBOX } from "./types"


export const handleIncommingCommDocuments = (handler?: WalletHandler, extensions?: ExtensionRegistry) => {
  const statusHandle: CommConnectionStatusHandler = { established: false }
  if (handler?.wallet && extensions) {
    const registry = handler.wallet?.getRegistry(REGISTRY_TYPE_INBOX)
    extensions.triggerEvent<InitCommEventParams>(handler.wallet, EVENT_INIT_CONNECTION, {
      statusHandle,
      trigger: async (conn, doc) => {
        if (registry) {
          if (!registry.getCredential(doc.id, REGISTRY_SECTION_PEER)) {
            console.info(`ext-comm: received message: ${doc.id}`)
            const wrapper = await registry.addCredential<
              IncommingCrednetialSubject, IncommingPresentation, IncommingMeta
            >(doc as IncommingPresentation, REGISTRY_SECTION_PEER)

            wrapper.meta.conn = conn

            handler.notify()
          }
        }
      }
    })
  }

  return statusHandle
}

export const useInboxRegistry = () => 
  useRegov().handler.wallet?.getRegistry(REGISTRY_TYPE_INBOX) as CredentialsRegistryWrapper