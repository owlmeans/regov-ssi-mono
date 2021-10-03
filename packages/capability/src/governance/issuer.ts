import {
  IssuerVisitorBuilder,
} from "@owlmeans/regov-ssi-agent"
import {
  ContextSchema,
  REGISTRY_TYPE_CREDENTIALS,
  REGISTRY_TYPE_IDENTITIES,
  WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { 
  CapabilitySubject, 
  CapabilityCredential,
  OfferCapabilityExtension,
  REGISTRY_TYPE_CAPABILITY 
} from "./types"
import { didChainHelper } from "../did/chain"


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

          unsigned.credentialSubject.chain = await didChainHelper(wallet)
            .collectForGovernance(
              unsigned.credentialSubject.data.credential.credentialSubject.source,
              unsigned.credentialSubject.data.credential.credentialSubject.root
            )
        }
      }
    }
  }
}
