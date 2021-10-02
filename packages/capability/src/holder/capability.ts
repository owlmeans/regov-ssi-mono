import { 
  HolderVisitorBuilder, 
  OfferBundle, 
  OfferCredential, 
  OfferSubject 
} from "@owlmeans/regov-ssi-agent"
import { 
  CredentialSubject, 
  WalletWrapper, 
  Credential, 
  WrappedDocument, 
  REGISTRY_TYPE_CREDENTIALS, 
  ContextSchema
} from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-did"
import { verifierCapabilityHelper } from "../verifier/capability"
import { 
  CapabilityCredential, 
  CapabilitySubject, 
  OfferCapability, 
  REGISTRY_SECTION_CAPABILITY 
} from "../governance/types"
import { ByCapabilityExtension } from "../issuer/types"


export const holderCapabilityVisitor = <
  Payload extends {} = {},
  Extension extends {} = {}
>(): HolderVisitorBuilder<
  Credential<CredentialSubject<
    WrappedDocument<Payload>, Extension
  >>,
  ByCapabilityExtension
> => (wallet: WalletWrapper) => {
  type SubjectT = CredentialSubject<WrappedDocument<Payload>, Extension>
  type CredentialT = Credential<SubjectT>
  type OfferBundleT = OfferBundle<OfferCredential<OfferSubject<CredentialT, ByCapabilityExtension>>>

  return {
    bundle: {
      store: {
        storeOffer: async (offer) => {
          offer.credentialSubject.chain?.map(
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
      },
      unbundle: {
        updateIssuer: async (offer: OfferBundleT, holder: string) => {
          const offerWithCap = offer.verifiableCredential.find(
            offer => offer.credentialSubject.capability?.holder.id === holder
          )
          if (offerWithCap) {
            return {
              credential: offerWithCap?.credentialSubject.capability,
              meta: { secure: false }
            }
          }
        },

        updateDid: async (offer: OfferBundleT, holder: string) => {
          const offerWithCap = offer.verifiableCredential.find(
            offer => offer.credentialSubject.capability?.id === holder
          )

          if (offerWithCap) {
            return offerWithCap.credentialSubject.did
          }
        },

        verifyHolder: async (offer: OfferBundleT, did: DIDDocument) => {
          const offerWithCap = offer.verifiableCredential.find(
            offer => offer.credentialSubject.did?.id === did.id
          )

          const chain = offerWithCap?.credentialSubject.chain
          if (!chain) {
            return false
          }

          return await verifierCapabilityHelper(wallet).verifyChain(chain, did)
        }
      },

      response: {
        build: {
          createSatellite: async (unsignedSatellite, credential) => {
            const wraps = await wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS).lookupCredentials<
              CapabilitySubject,
              CapabilityCredential
            >(
              credential.credentialSubject.data["@type"],
              REGISTRY_SECTION_CAPABILITY
            )

            if (wraps.length > 0) {
              const context = unsignedSatellite["@context"] as (string | ContextSchema)[]
              context.push(
                wallet.ssi.buildContext(
                  'capability/satellite',
                  { 
                    capability: { '@id': 'scm:capability', '@type': '@json' },
                    chain: { '@id': 'scm:chain', '@type': '@json' },
                  }
                )
              )

              unsignedSatellite.credentialSubject.data = {
                ...unsignedSatellite.credentialSubject.data,
                capability: wraps[0].credential,
                chain: await wallet.did.gatherChain(wraps[0].credential.id)
              }
            }
          }
        }
      }
    }
  }
}