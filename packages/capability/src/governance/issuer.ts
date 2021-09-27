import {
  IssuerVisitorBuilder,
} from "@owlmeans/regov-ssi-agent"
import {
  ContextSchema,
  WalletWrapper
} from "@owlmeans/regov-ssi-core"
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
          const chain = await wallet.did.gatherChain(
            unsigned.credentialSubject.data.credential.credentialSubject.source,
            unsigned.credentialSubject.data.credential.credentialSubject.root
            || unsigned.credentialSubject.data.credential.credentialSubject.source
          );

          (unsigned['@context'] as ContextSchema[])[1].chain 
            = { '@id': 'scm:chain', '@type': '@json' } 
          
          unsigned.credentialSubject.chain = chain
        }
      }
    }
  }
}
