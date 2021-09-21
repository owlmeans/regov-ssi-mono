import {
  IssuerVisiterBuilder,
} from "@owlmeans/regov-ssi-agent"
import {
  REGISTRY_TYPE_CREDENTIALS,
  WalletWrapper
} from "@owlmeans/regov-ssi-core"
import {
  CapabilityCredential,
  CapabilitySubject,
  CREDENTIAL_CAPABILITY_TYPE,
  REGISTRY_SECTION_CAPABILITY
} from "../governance/types"
import {
  ByCapabilityExtension,
  CAPABILITY_BYOFFER_TYPE,
  ERROR_AMBIGOUS_CAPABILITY_TO_PATCH
} from "./types"


/**
 * @PROCEED
 * @TODO It looks like we need to start developing test
 * cases and bundle helpers based on them.
 * Case 1: Charly provides Bob a Capability. Bob signs a capability
 * based credentail to Alice. Dan trusts charly. Alice shows the
 * credential to Dan. Dan aknowledge credential as trusted.
 * 
 * Case 2: The same. But Bob hires Emma and delegate capability to her.
 * Emma signs credential istead of Bob. But Dan still aknowledges it.
 */
export const issuerVisiter: IssuerVisiterBuilder<ByCapabilityExtension> = (wallet: WalletWrapper) => {
  return {
    claim: {
      signClaim: {
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