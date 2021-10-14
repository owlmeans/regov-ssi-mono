import {
  HolderVisitorBuilder,
  identityHelper,
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
  ContextSchema,
  REGISTRY_SECTION_PEER
} from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-did"
import { verifierCapabilityHelper } from "../verifier/capability"
import {
  CapabilityCredential,
  CapabilitySubject,
  OfferCapability,
  REGISTRY_TYPE_CAPABILITY
} from "../governance/types"
import { ByCapabilityExtension } from "../issuer/types"
import { didChainHelper, isCapability } from ".."


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

          offer.credentialSubject.capabilities.forEach(
            cap => wallet.getRegistry(REGISTRY_TYPE_CAPABILITY)
              .addCredential(cap, REGISTRY_SECTION_PEER)
          )
        }
      },
      unbundle: {
        updateIssuer: async (offer: OfferBundleT, holder: string) => {
          const offerWithCap = offer.verifiableCredential.find(
            offer => offer.credentialSubject.capabilities
              && offer.credentialSubject.capabilities[0]?.holder.id === holder
          )
          if (offerWithCap) {
            return {
              credential: offerWithCap?.credentialSubject.capabilities[0],
              meta: { secure: false }
            }
          }
        },

        updateDid: async (offer: OfferBundleT, holder: string) => {
          const offerWithCap = offer.verifiableCredential.find(
            offer => offer.credentialSubject.capabilities
              && offer.credentialSubject.capabilities[0]?.id === holder
          )

          if (offerWithCap) {
            const entity = identityHelper(wallet)
              .extractEntity([...offer.verifiableCredential])

            return entity?.credentialSubject.did
          }
        },

        verifyHolder: async (offer: OfferBundleT, issuerDid: DIDDocument) => {
          const offerWithCap = offer.verifiableCredential.find(
            offer =>
              offer.credentialSubject.capabilities
              && isCapability(offer.credentialSubject.capabilities[0])
              && offer.credentialSubject.did?.verificationMethod?.some(
                method => method.controller === issuerDid.id
              )
          )

          const chain = offerWithCap?.credentialSubject.chain
          if (chain && wallet.did.registry.peer.dids.find(
            did => did.did.id === chain[chain.length - 1].id
          )) {
            return true
          }

          return false
          // return await verifierCapabilityHelper(wallet).verifyChain(chain)
        }
      },

      response: {
        build: {
          createSatellite: async (unsignedSatellite, credential) => {
            const wraps = await wallet.getRegistry(REGISTRY_TYPE_CAPABILITY).lookupCredentials<
              CapabilitySubject,
              CapabilityCredential
            >(credential.credentialSubject.data["@type"], REGISTRY_SECTION_PEER)

            if (wraps.length > 0) {
              const context = unsignedSatellite["@context"] as (string | ContextSchema)[]
              context.push(
                wallet.ssi.buildContext(
                  'capability/satellite',
                  {
                    capabilities: { '@id': 'scm:capabilities', '@type': '@json' },
                    chain: { '@id': 'scm:chain', '@type': '@json' },
                  }
                )
              )

              const gov = wallet.getRegistry(REGISTRY_TYPE_CAPABILITY)
                .getCredential<
                  CapabilitySubject, CapabilityCredential
                >(wraps[0].credential.credentialSubject.root)?.credential

              unsignedSatellite.credentialSubject.data = {
                ...unsignedSatellite.credentialSubject.data,
                capabilities: [wraps[0].credential, ...(gov ? [gov] : [])],
                chain: await didChainHelper(wallet)
                  .collectForIssuedCredential(wraps[0].credential)
              }
            }
          }
        }
      }
    }
  }
}