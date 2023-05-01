/**
 *  Copyright 2023 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {
  AddDIDMethod, DIDRegistry, DIDRegistryWrapper, DIDRegistryBundle, DID_REGISTRY_ERROR_NO_KEY_BY_DID,
  LookUpDidMethod, DID_CHAIN_DEAD_END, WRAPPER_SOURCE_PEER_CONTROLLER, WRAPPER_SOURCE_OWN_CONTROLLER,
  WRAPPER_SOURCE_PEER_ID, WRAPPER_SOURCE_OWN_ID
} from "./types/registry"
import { DIDDocument, DIDHelper } from "./types"
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
      if (didDocW) {
        didDocW.source = WRAPPER_SOURCE_OWN_ID
      }
      if (!didDocW) {
        didDocW = _peerRegistry.dids.find(
          did => did.did.id === parsed.did
        )
        if (didDocW) {
          didDocW.source = WRAPPER_SOURCE_PEER_ID
        }
      }
      if (!didDocW) {
        didDocW = _registry.dids.find(
          did => didHelper.extractProofController(did.did) === parsed.did
        )
        if (didDocW) {
          didDocW.source = WRAPPER_SOURCE_OWN_CONTROLLER
        }
      }
      if (!didDocW) {
        didDocW = _peerRegistry.dids.find(
          did => didHelper.extractProofController(did.did) === parsed.did
        )
        if (didDocW) {
          didDocW.source = WRAPPER_SOURCE_PEER_CONTROLLER
        }
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