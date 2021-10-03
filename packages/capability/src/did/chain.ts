import {
  Identity,
  IdentitySubject,
  REGISTRY_SECTION_OWN,
  REGISTRY_SECTION_PEER,
  REGISTRY_TYPE_CREDENTIALS,
  REGISTRY_TYPE_IDENTITIES,
  WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-did"
import { isGovernanceCapability } from "../governance/credential"
import {
  CapabilityCredential,
  CapabilitySubject,
  ERROR_WRONG_GOVERNANCE_CHAIN,
  OfferCapability,
  REGISTRY_TYPE_CAPABILITY
} from "../governance/types"


export const didChainHelper = (wallet: WalletWrapper) => {
  const _helper = {
    /**
     * @TODO Refactor to just collect chain directly how it should be
     * without some special heuristics.
     */
    collectForGovernance: async (did: DIDDocument | string, root?: string): Promise<DIDDocument[]> => {
      const id = typeof did === 'string' ? did : did.id
      const capability = wallet.getRegistry(REGISTRY_TYPE_CAPABILITY).getCredential<
        CapabilitySubject, CapabilityCredential
      >(id)?.credential
      if (isGovernanceCapability(capability)) {
        const source = capability.credentialSubject.source
        const chain = [
          ...await wallet.did.gatherChain(id)
        ]
        if (root === source.id) {
          return chain
        }
        /**
         * Empty root is a self issuer identity
         */
        let _root = capability.credentialSubject.root
          || wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential()?.credential.id

        if (_root) {
          return [...chain, ...await _helper.collectForGovernance(_root, root || _root)]
        }

        throw new Error(ERROR_WRONG_GOVERNANCE_CHAIN)
      }

      const identity = [REGISTRY_SECTION_OWN, REGISTRY_SECTION_PEER].map(
        section => wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
          .getCredential<IdentitySubject, Identity<IdentitySubject>>(id, section)?.credential
      ).find(credential => credential)
      if (identity) {
        return [...await wallet.did.gatherChain(id, root)]
      }

      if (typeof did === 'string') {
        throw new Error(ERROR_WRONG_GOVERNANCE_CHAIN)
      }

      return [did, ...(root ? await wallet.did.gatherChain(root) : [])]
    },

    collectForIssuedCredential: async (
      source: CapabilityCredential, did?: DIDDocument
    ): Promise<DIDDocument[]> => {
      /**
       * Structure:
       * 1. Provided capability by issuer
       * 2. Self-issued governance capability of issuer
       * 3. Self-issued identity of issuer 
       */
      const trustedIdentityDid =
        source.credentialSubject.root
          ? await wallet.did.lookUpDid<DIDDocument>(source.credentialSubject.root)
          : undefined

      const capabilitySubchain = did ? await wallet.did.gatherChain(did.id) || [did] : []
      const sourceSubchain = source.credentialSubject.source
        ? await wallet.did.gatherChain(source.credentialSubject.source.id)
        || [source.credentialSubject.source]
        : []
      const trustedSubchain = trustedIdentityDid
        ? await wallet.did.gatherChain(trustedIdentityDid.id) || [trustedIdentityDid]
        : []

      const chain: DIDDocument[] = [
        ...capabilitySubchain,
        ...sourceSubchain,
        ...trustedSubchain
      ]

      return chain
    },

  }

  return _helper
}