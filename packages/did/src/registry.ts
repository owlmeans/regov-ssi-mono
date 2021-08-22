import { AddDIDMethod, DIDDocumentWrapper, DIDRegistry, DIDRegistryWrapper, DIDRegistryBundle } from "./types/registry"
import { DIDDocumentPurpose, DIDDocument, DIDHelper, DIDPURPOSE_VERIFICATION } from "./types"
import { CommonCryptoKey } from "metabelarusid-common"

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
          || did.did.proof.controller === parsed.did
      )
      if (!didDocW) {
        didDocW = _peerRegistry.dids.find(
          did => did.did.id === parsed.did
            || did.did.proof.controller === parsed.did
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

    return {
      registry,

      lookUpDid: _lookUpDid,

      extractKey: async (did) => {
        const didW = <DIDDocumentWrapper>await _lookUpDid(did, true)
        if (didW.key) {
          throw new SyntaxError('WE NEED TO LOOKUP KEY FROM SOME PROVIDED METHOD')
        }

        const explained = didHelper.parseDIDId(did)
        const [method, idx] = explained.fragment
          ? <[DIDDocumentPurpose, string]>explained.fragment.split('-', 2)
          : [DIDPURPOSE_VERIFICATION, '1']

        const verification = didW.did[<DIDDocumentPurpose>method]

        let producedKey: CommonCryptoKey = {}
        if (verification && Array.isArray(verification)) {
          const verificationItem = verification.find(
            verification => typeof verification === 'string'
              ? verification === `${explained.did}#${method}-${idx}`
              : verification.id === `${explained.did}#${method}-${idx}`
          )
          const nextKeyDigest = (nonce => nonce.length > 1 ? nonce[1] : undefined)
            (didW.did.proof.nonce.split(':', 2))
          const fragment = `${method}-${idx}`
          if (typeof verificationItem === 'string') {
            const keyInfo = didW.did.publicKey.find(key => key.id === verificationItem)

            producedKey = {
              id: didW.did.proof.controller,
              pubKey: keyInfo?.publicKeyBase58,
              nextKeyDigest,
              fragment
            }
          } else if (typeof verificationItem === 'object') {
            producedKey = {
              id: verificationItem.controller,
              pubKey: verificationItem.publicKeyBase58,
              nextKeyDigest,
              fragment
            }
          }
        }

        return producedKey
      },

      addDID: _buildAddDIDMethod(_registry),

      addPeerDID: _buildAddDIDMethod(_peerRegistry),

      helper: () => didHelper
    }
  }