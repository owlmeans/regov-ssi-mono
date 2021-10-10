import {
  HolderVisitor,
  HolderVisitorBuilder,
  IssuerVisitorBuilder,
  OfferBundle,
} from "@owlmeans/regov-ssi-agent"
import {
  ContextSchema,
  REGISTRY_SECTION_OWN,
  REGISTRY_SECTION_PEER,
  REGISTRY_TYPE_IDENTITIES,
  WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { DIDDocument, DIDPURPOSE_VERIFICATION, VERIFICATION_KEY_CONTROLLER, VERIFICATION_KEY_HOLDER } from "@owlmeans/regov-ssi-did"
import { isCapability } from "."
import { verifierCapabilityHelper } from "../verifier/capability"
import {
  CapabilityCredential,
  OfferCapabilityExtension,
  CREDENTIAL_CAPABILITY_TYPE,
  OfferCapability,
  REGISTRY_TYPE_CAPABILITY
} from "./types"


export const holderGovernanceVisitor: HolderVisitorBuilder<
  CapabilityCredential,
  OfferCapabilityExtension,
  OfferCapability
> = (wallet: WalletWrapper) => {
  type OfferBundleT = OfferBundle<OfferCapability>

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
        },

        castRegistry: (offer) => {
          return offer.credentialSubject.data
            .credential.type.includes(CREDENTIAL_CAPABILITY_TYPE)
            ? REGISTRY_TYPE_CAPABILITY
            : undefined
        }
      },

      unbundle: {
        updateIssuer: async (offer: OfferBundleT, holder: string) => {
          const offerWithCap = offer.verifiableCredential.find(
            offer => offer.credentialSubject.data.credential?.issuer === holder
          )
          if (offerWithCap) {
            return await wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
              .getCredential(
                offerWithCap.credentialSubject.data.credential.issuer,
                REGISTRY_SECTION_PEER
              )
          }
        },

        updateDid: async (offer: OfferBundleT, holder: string) => {
          const offerWithCap = offer.verifiableCredential.find(
            offer => offer.credentialSubject.data.credential?.issuer === holder
          )

          if (offerWithCap) {
            return offerWithCap.credentialSubject.did
          }
        },

        verifyHolder: async (offer: OfferBundleT, issuerDid: DIDDocument) => {
          const offerWithCap = offer.verifiableCredential.find(
            offer => {
              const did = offer.credentialSubject.did
              const keyId = did.verificationMethod && did.verificationMethod.length > 1
                ? VERIFICATION_KEY_CONTROLLER
                : VERIFICATION_KEY_HOLDER
              return isCapability(offer.credentialSubject.data.credential)
                && issuerDid.id
                === wallet.did.helper().extractProofController(did, keyId)
            }
          )

          const chain = offerWithCap?.credentialSubject.chain
          if (!chain) {
            return false
          }

          return await verifierCapabilityHelper(wallet).verifyChain(chain, {
            did: offerWithCap?.credentialSubject?.did || issuerDid,
            /**
             * It isn't required here, because the credential is capability itself
             */
            capability: offerWithCap?.credentialSubject.data.credential
          })
        }
      }
    }
  }
}