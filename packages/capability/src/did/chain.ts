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
  REGISTRY_SECTION_CAPABILITY
} from "../governance/types"


export const didChainHelper = (wallet: WalletWrapper) => {
  const _helper = {
    /**
     * @TODO Refactor to just collect chain directly how it should be
     * without some special heuristics.
     */
    collectForGovernance: async (did: DIDDocument | string, root?: string): Promise<DIDDocument[]> => {
      const id = typeof did === 'string' ? did : did.id
      const capability = wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS).getCredential<
        CapabilitySubject, CapabilityCredential
      >(id, REGISTRY_SECTION_CAPABILITY)?.credential
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

    collectForCapability: async (source: CapabilityCredential): Promise<DIDDocument[]> => {
      /**
       * @PROCEED
       * @TOOD Just collect did chain the way it was built
       * for the governance capability + did of this capability
       */
      return []
    },

  }

  return _helper
}