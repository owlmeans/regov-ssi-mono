import {
  IssuerVisitorBuilder,
} from "@owlmeans/regov-ssi-agent"
import {
  ContextSchema,
  REGISTRY_TYPE_CREDENTIALS,
  REGISTRY_TYPE_IDENTITIES,
  WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { CapabilitySubject, REGISTRY_SECTION_CAPABILITY } from "."
import { didChainHelper } from "../did/chain"
import {
  CapabilityCredential,
  OfferCapabilityExtension,
} from "./types"


export const issuerGovernanceVisitor: IssuerVisitorBuilder<
  OfferCapabilityExtension,
  CapabilityCredential
> = (wallet: WalletWrapper) => {
  return {
    claim: {
      signClaim: {
        patchOffer: async (unsigned) => {
          (unsigned['@context'] as ContextSchema[])[1].chain
            = { '@id': 'scm:chain', '@type': '@json' }

          unsigned.credentialSubject.chain = await didChainHelper(wallet).collectGovernanceChain(
            unsigned.credentialSubject.data.credential.credentialSubject.source,
            unsigned.credentialSubject.data.credential.credentialSubject.root
          )
        }
      }
    }
  }
}
