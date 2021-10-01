import {
  IssuerVisitorBuilder,
} from "@owlmeans/regov-ssi-agent"
import {
  ContextSchema,
  REGISTRY_TYPE_CREDENTIALS,
  WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-did"
import {
  CapabilityCredential,
  CapabilitySubject,
  CREDENTIAL_CAPABILITY_TYPE,
  REGISTRY_SECTION_CAPABILITY
} from "../governance/types"
import {
  ByCapabilityExtension,
  CAPABILITY_BYOFFER_TYPE,
  ERROR_AMBIGOUS_CAPABILITY_TO_PATCH,
  ERROR_NO_RELATED_DID_WITH_CAPABILITY
} from "./types"


export const issuerVisitor: IssuerVisitorBuilder<ByCapabilityExtension> = (wallet: WalletWrapper) => {
  return {
    claim: {
      signClaim: {
        clarifyIssuer: async (unsigned) => {
          const capabilities = await wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS).lookupCredentials<
            CapabilitySubject, CapabilityCredential<CapabilitySubject>
          >(
            [CREDENTIAL_CAPABILITY_TYPE, ...unsigned.type],
            REGISTRY_SECTION_CAPABILITY
          )

          const did = await wallet.did.lookUpDid<DIDDocument>(capabilities[0].credential.id)
          if (!did) {
            throw new Error(ERROR_NO_RELATED_DID_WITH_CAPABILITY)
          }

          return did
        },

        patchOffer: async (unsigned) => {
          unsigned.type.push(CAPABILITY_BYOFFER_TYPE)
          const capabilities = await wallet.getRegistry(REGISTRY_TYPE_CREDENTIALS).lookupCredentials<
            CapabilitySubject, CapabilityCredential<CapabilitySubject>
          >(
            [CREDENTIAL_CAPABILITY_TYPE, ...unsigned.credentialSubject.data.credential.type],
            REGISTRY_SECTION_CAPABILITY
          )
          if (capabilities.length > 0) {
            /**
             * @TODO Same capability can be provided by different
             * governance. We need to match provided capability
             * and issued credential
             */
            if (capabilities.length > 1) {
              throw new Error(ERROR_AMBIGOUS_CAPABILITY_TO_PATCH)
            }

            const context = unsigned["@context"] as (string | ContextSchema)[]
            context.push(
              wallet.ssi.buildContext(
                'offer/with-capability',
                { 
                  capability: { '@id': 'scm:capability', '@type': '@json' },
                  chain: { '@id': 'scm:chain', '@type': '@json' },
                }
              )
            )

            /**
             * @PROCEED
             * @TODO We need to use chain helper to build proper chain:
             * 1. Go through capability chain 
             * 2. And finish with governance chain
             * 
             * !!!It's important to solve other: gatherChain calls afterwards!
             */
            unsigned.credentialSubject = {
              ...unsigned.credentialSubject,
              chain: await wallet.did.gatherChain(
                unsigned.credentialSubject.data.credential.issuer
              ),
              capability: capabilities[0].credential
            }
          }
        }
      }
    }
  }
}