import { ExtractKeyMethod } from ".."
import { DIDDocument, DIDHelper } from "../types"

export type DIDDocumentWrapper = {
  did: DIDDocument
  source?: string
  key?: string
}

export const WRAPPER_SOURCE_PEER_CONTROLLER = 'peer_controller'
export const WRAPPER_SOURCE_OWN_CONTROLLER = 'own_controller'
export const WRAPPER_SOURCE_PEER_ID = 'peer_id'
export const WRAPPER_SOURCE_OWN_ID = 'own_id'

export type DIDRegistry = {
  dids: DIDDocumentWrapper[],
}

export type DIDRegistryBundle = {
  personal: DIDRegistry
  peer: DIDRegistry
}

export type DIDRegistryWrapper = {
  registry: DIDRegistryBundle

  lookUpDid: LookUpDidMethod

  gatherChain: GatherChain

  addDID: AddDIDMethod
  addPeerDID: AddDIDMethod

  extractKey: ExtractKeyMethod

  helper(): DIDHelper
}

export type GatherChain = (to: string, from? :string) => Promise<DIDDocument[]>

export type LookUpDidMethod = <
  T extends DIDDocumentWrapper | DIDDocument
  >(did: string, wrapped?: true | undefined) => Promise<T | undefined>

export type AddDIDMethod = (did: DIDDocument, key?: string) => void

export const DID_REGISTRY_ERROR_NO_KEY_BY_DID = 'DID_REGISTRY_ERROR_NO_KEY_BY_DID'
export const DID_REGISTRY_ERROR_NO_DID = 'DID_REGISTRY_ERROR_NO_DID'
export const DID_ERROR_INVALID = 'DID_ERROR_INVALID'

export const DID_CHAIN_DEAD_END = 'DID_CHAIN_DEAD_END'