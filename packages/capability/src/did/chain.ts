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
    collectForGovernance: async (did: DIDDocument | string, root?: string): Promise<DIDDocument[]> => {
      const id = typeof did === 'string' ? did : did.id
      if (typeof did === 'string') {
        did = await wallet.did.lookUpDid<DIDDocument>(did) || did
      }
      if (typeof did === 'string') {
        throw new Error(ERROR_WRONG_GOVERNANCE_CHAIN)
      }
      const capability = wallet.getRegistry(REGISTRY_TYPE_CAPABILITY).getCredential<
        CapabilitySubject, CapabilityCredential
      >(root)?.credential // id
      if (isGovernanceCapability(capability)) {
        return [
          did,
          ...await _helper.collectForGovernance(
            capability.credentialSubject.source,
            capability.credentialSubject.root
          )
        ]
      }

      const identity = [REGISTRY_SECTION_OWN, REGISTRY_SECTION_PEER].map(
        section => wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
          .getCredential<IdentitySubject, Identity<IdentitySubject>>(id, section)?.credential
      ).find(credential => credential)
      if (identity) {
        return [...await wallet.did.gatherChain(id, root)]
      }

      return [did, ...(root ? await wallet.did.gatherChain(root) : [])]
    },

    collectForIssuedCredential: async (source: CapabilityCredential): Promise<DIDDocument[]> => {
      /**
       * Structure:
       * 1. Provided capability by issuer
       * 2. Self-issued governance capability of issuer
       * 3. Self-issued identity of issuer 
       */

      // const capabilitySubchain = did ? await wallet.did.gatherChain(did.id) || [did] : []

      const capabilityDid = await wallet.did.lookUpDid<DIDDocument>(source.id)
      const capabilitySubchain = capabilityDid ? [capabilityDid] : []

      const sourceSubchain = source.credentialSubject.source
        ? await wallet.did.gatherChain(source.credentialSubject.source.id)
        || [source.credentialSubject.source]
        : []

      const trustedIdentityDid =
        source.credentialSubject.root
          ? await wallet.did.lookUpDid<DIDDocument>(source.credentialSubject.root)
          : undefined
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