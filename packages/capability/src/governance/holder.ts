import {
  HolderVisitor,
  HolderVisitorBuilder,
  IssuerVisitorBuilder,
} from "@owlmeans/regov-ssi-agent"
import {
  ContextSchema,
  WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { OfferCapability } from "."
import {
  CapabilityCredential,
  OfferCapabilityExtension,
} from "./types"


export const holderGovernanceVisitor: HolderVisitorBuilder<
  CapabilityCredential,
  OfferCapabilityExtension,
  OfferCapability
> = (wallet: WalletWrapper) => {
  return {
    bundle: {
      store: {
        storeOffer: async (offer) => {
          offer.credentialSubject.chain.map(
            async did => {
              if (![
                ...wallet.did.registry.personal.dids,
                ...wallet.did.registry.peer.dids
              ].find(_did => _did.did.id === did.id)) {
                wallet.did.addPeerDID(did)
              }
            }
          )
        }
      }
    }
  }
}