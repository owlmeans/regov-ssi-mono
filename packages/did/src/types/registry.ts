import { CommonCryptoKey } from "@owlmeans/regov-ssi-common"
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
  registry: DIDRegistryBundle,

  lookUpDid: <T extends DIDDocument| DIDDocumentWrapper>(did: string, wrapped?: boolean) => Promise<T | undefined>

  extractKey: (did: string) => Promise<CommonCryptoKey>
  addDID: AddDIDMethod
  addPeerDID: AddDIDMethod
  helper(): DIDHelper
}

export type AddDIDMethod = (did: DIDDocument, key?: string) => void