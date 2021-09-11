import { CommonCryptoKey } from "@owlmeans/regov-ssi-common"
import { ExtractKeyMethod } from ".."
import { DIDDocument, DIDHelper } from "../types"

export type DIDDocumentWrapper = {
  did: DIDDocument,
  key?: string,
}

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

  addDID: AddDIDMethod
  addPeerDID: AddDIDMethod

  extractKey: ExtractKeyMethod

  helper(): DIDHelper
}

export type LookUpDidMethod = <
  T extends DIDDocumentWrapper | DIDDocument
  >(did: string, wrapped?: true | undefined) => Promise<T | undefined>

export type AddDIDMethod = (did: DIDDocument, key?: string) => void

export const DID_REGISTRY_ERROR_NO_KEY_BY_DID = 'DID_REGISTRY_ERROR_NO_KEY_BY_DID'
export const DID_REGISTRY_ERROR_NO_DID = 'DID_REGISTRY_ERROR_NO_DID'