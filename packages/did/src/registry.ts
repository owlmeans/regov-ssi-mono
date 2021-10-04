import {
  AddDIDMethod,
  DIDRegistry,
  DIDRegistryWrapper,
  DIDRegistryBundle,
  DID_REGISTRY_ERROR_NO_KEY_BY_DID,
  LookUpDidMethod,
  DID_CHAIN_DEAD_END
} from "./types/registry"
import {
  DIDDocument,
  DIDHelper
} from "./types"
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

      gatherChain: async (to, from?) => {
        const toDid = await _lookUpDid<DIDDocument>(to)
        if (toDid) {
          if (toDid.alsoKnownAs) {
            if (!from || from !== toDid.id ) {
              return [toDid, ...await wrapper.gatherChain(toDid.alsoKnownAs[0], from)]
            }
          } else if (from && toDid.id !== from) {
            throw new Error(DID_CHAIN_DEAD_END)
          }

          return [toDid]
        }
        return []
      },

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