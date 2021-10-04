import {
  IssuerVisitorBuilder,
} from "@owlmeans/regov-ssi-agent"
import {
  ContextSchema,
  REGISTRY_TYPE_CREDENTIALS,
  WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-did"
import { didChainHelper } from "../did/chain"
import {
  CapabilityCredential,
  CapabilitySubject,
  CREDENTIAL_CAPABILITY_TYPE,
  REGISTRY_TYPE_CAPABILITY
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
          const capabilities = await wallet.getRegistry(REGISTRY_TYPE_CAPABILITY).lookupCredentials<
            CapabilitySubject, CapabilityCredential<CapabilitySubject>
          >(
            [CREDENTIAL_CAPABILITY_TYPE, ...unsigned.type]
          )

          const did = await wallet.did.lookUpDid<DIDDocument>(capabilities[0].credential.id)
          if (!did) {
            throw new Error(ERROR_NO_RELATED_DID_WITH_CAPABILITY)
          }

          return did
        },

        patchOffer: async (unsigned, did) => {
          unsigned.type.push(CAPABILITY_BYOFFER_TYPE)
          const capabilities = await wallet.getRegistry(REGISTRY_TYPE_CAPABILITY).lookupCredentials<
            CapabilitySubject, CapabilityCredential<CapabilitySubject>
          >(
            [CREDENTIAL_CAPABILITY_TYPE, ...unsigned.credentialSubject.data.credential.type]
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

            const chain = await didChainHelper(wallet).collectForIssuedCredential(
              capabilities[0].credential, did
            )

            unsigned.credentialSubject = {
              ...unsigned.credentialSubject,
              chain,
              capability: capabilities[0].credential
            }
          }
        }
      }
    }
  }
}