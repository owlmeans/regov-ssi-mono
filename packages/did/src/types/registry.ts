import { CommonCryptoKey } from "metabelarusid-common"
import { DIDDocumnet, DIDHelper } from "../types"

export type DIDDocumentWrapper = {
  did: DIDDocumnet,
  key?: string,
}

export type DIDRegistry = {
  dids: DIDDocumentWrapper[],
}

export type DIDRegistryWrapper = {
  registry: DIDRegistry,

  lookUpDid: <T extends DIDDocumnet| DIDDocumentWrapper>(did: string, wrapped?: boolean) => Promise<T | undefined>

  extractKey: (did: string) => Promise<CommonCryptoKey>
  addDID: AddDIDMethod
  addPeerDID: AddDIDMethod
  helper(): DIDHelper
}

export type AddDIDMethod = (did: DIDDocumnet, key?: string) => void