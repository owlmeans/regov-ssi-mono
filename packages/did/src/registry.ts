import { AddDIDMethod, DIDDocumentWrapper, DIDRegistry, DIDRegistryWrapper, DIDRegistryBundle, DID_REGISTRY_ERROR_NO_KEY_BY_DID, LookUpDidMethod } from "./types/registry"
import { DIDDocumentPurpose, DIDDocument, DIDHelper, DIDPURPOSE_VERIFICATION, DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD, DIDVerificationItem } from "./types"
import { CommonCryptoKey } from "@owlmeans/regov-ssi-common"
import { DIDPURPOSE_ASSERTION, DID_ERROR_VERIFICATION_METHOD_LOOKUP } from "."
import { buildDocumentLoader } from "./loader"

export const buildDidRegistryWarpper: (didHelper: DIDHelper, registry?: DIDRegistryBundle) =>
  DIDRegistryWrapper = (didHelper, registry?) => {
    registry = registry || {
      personal: { dids: [] },
      peer: { dids: [] }
    }

    const { personal: _registry, peer: _peerRegistry } = registry

    const _lookUpDid: LookUpDidMethod = async (did: string, wrapped?: true | undefined) => {
      const parsed = didHelper.parseDIDId(did)

      let didDocW = _registry.dids.find(
        did => did.did.id === parsed.did
      )
      if (!didDocW) {
        didDocW = _peerRegistry.dids.find(
          did => did.did.id === parsed.did
        )
      }
      if (!didDocW) {
        didDocW = _registry.dids.find(
          did => didHelper.extractProofController(did.did) === parsed.did
        )
      }
      if (!didDocW) {
        didDocW = _peerRegistry.dids.find(
          did => didHelper.extractProofController(did.did) === parsed.did
        )
      }

      return (wrapped ? didDocW : didDocW?.did) as any
    }

    const _buildAddDIDMethod: (resitry: DIDRegistry) => AddDIDMethod =
      (registry) => (did, key) => {
        registry.dids.push({
          did,
          ...(key ? { key } : {})
        })
      }

    const wrapper: DIDRegistryWrapper = {
      registry,

      lookUpDid: _lookUpDid,

      addDID: _buildAddDIDMethod(_registry),

      addPeerDID: _buildAddDIDMethod(_peerRegistry),

      extractKey: async (did, keyId) => {
        if (typeof did === 'string') {
          did = <DIDDocument>await _lookUpDid(did)
        }

        if (!did) {
          throw new Error(DID_REGISTRY_ERROR_NO_KEY_BY_DID)
        }

        return didHelper.extractKey(did, keyId)
      },

      helper: () => didHelper
    }

    didHelper.setupDocumentLoader(buildDocumentLoader(wrapper))

    return wrapper
  }