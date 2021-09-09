import { AddDIDMethod, DIDDocumentWrapper, DIDRegistry, DIDRegistryWrapper, DIDRegistryBundle, DID_REGISTRY_ERROR_NO_KEY_BY_DID } from "./types/registry"
import { DIDDocumentPurpose, DIDDocument, DIDHelper, DIDPURPOSE_VERIFICATION, DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD } from "./types"
import { CommonCryptoKey } from "@owlmeans/regov-ssi-common"
import { DIDPURPOSE_ASSERTION } from "."
import { buildDocumentLoader } from "./loader"

export const buildDidRegistryWarpper: (didHelper: DIDHelper, registry?: DIDRegistryBundle) =>
  DIDRegistryWrapper = (didHelper, registry?) => {
    registry = registry || {
      personal: { dids: [] },
      peer: { dids: [] }
    }

    const { personal: _registry, peer: _peerRegistry } = registry

    const _lookUpDid = async <T extends DIDDocumentWrapper | DIDDocument>(
      did: string, wrapped?: boolean
    ): Promise<T | undefined> => {
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

      return <T>(wrapped ? didDocW : didDocW?.did)
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

      extractKey: async (did) => {
        const didW = <DIDDocumentWrapper>await _lookUpDid(did, true)
        if (!didW) {
          throw new Error(DID_REGISTRY_ERROR_NO_KEY_BY_DID)
        }
        if (didW.key) {
          throw new SyntaxError('WE NEED TO LOOKUP KEY FROM SOME PROVIDED METHOD')
        }

        const explained = didHelper.parseDIDId(did)
        did = explained.fragment ? did : `${did}#${DIDPURPOSE_ASSERTION}-1`
        
        let verificationItem = didHelper.expandVerificationMethod(didW.did, did)

        if (!verificationItem) {
          throw Error(DID_ERROR_VERIFICATION_NO_VERIFICATION_METHOD)
        }

        if (!verificationItem.controller) {
          verificationItem = didHelper.expandVerificationMethod(
            didW.did, 
            // @TODO Fix potential bug with unsequential keys adding
            `${explained.did}#${DIDPURPOSE_VERIFICATION}-${explained.keyIdx || 1}`
          )
        }

        return {
          id: verificationItem.controller,
          pubKey: verificationItem.publicKeyBase58,
          nextKeyDigest: (nonce => nonce && nonce.length > 1 ? nonce[1] : undefined)
            (verificationItem.nonce?.split(':', 2)),
          fragment: explained.fragment || `${DIDPURPOSE_ASSERTION}-1`
        }
      },

      addDID: _buildAddDIDMethod(_registry),

      addPeerDID: _buildAddDIDMethod(_peerRegistry),

      helper: () => didHelper
    }

    didHelper.setupDocumentLoader(buildDocumentLoader(wrapper))

    return wrapper
  }