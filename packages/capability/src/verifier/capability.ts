
import {
  CREDENTIAL_SATELLITE_TYPE,
  EntityIdentity,
  isSatellite,
  SatelliteSubject,
  verifierCredentialHelper
} from "@owlmeans/regov-ssi-agent"
import {
  Presentation,
  WalletWrapper,
  Credential,
  REGISTRY_TYPE_IDENTITIES,
  REGISTRY_SECTION_PEER,
  Identity,
  IdentitySubject,
  REGISTRY_SECTION_OWN
} from "@owlmeans/regov-ssi-core"
import { DIDDocument, VERIFICATION_KEY_CONTROLLER, VERIFICATION_KEY_HOLDER } from "@owlmeans/regov-ssi-did"
import { CapabilityCredential } from ".."
import { ByCapabilityExtension } from "../issuer/types"


export const verifierCapabilityHelper = <
  CredentialT extends Credential = Credential
>(wallet: WalletWrapper) => {
  type CapabilitySatellite = Credential<SatelliteSubject<ByCapabilityExtension>>
  type PresentedCredential = EntityIdentity | CredentialT | CapabilitySatellite

  const _helper = {
    response: () => {
      return {
        verify: async (presentation: Presentation<PresentedCredential>) => {
          let { result, credentials, dids, entity } = await verifierCredentialHelper(wallet)
            .response().verify(presentation)

          const setallites: CapabilitySatellite[] = presentation.verifiableCredential.filter(
            cred => isSatellite(cred)
          ) as CapabilitySatellite[]
          if (setallites.length > 0) {
            result = await setallites.reduce(
              async (result, satellite) => {
                if (!await result) {
                  return false
                }

                if (satellite.credentialSubject.data.capability) {
                  const [result, info] = await wallet.ssi.verifyCredential(
                    satellite.credentialSubject.data.capability,
                    satellite.credentialSubject.data.did
                  )
                  if (result) {
                    return await _helper.verifyChain(
                      satellite.credentialSubject.data.chain,
                      {
                        did: satellite.credentialSubject.data.did
                      }
                    )
                  } else {
                    console.log(info)
                    return false
                  }
                }

                return true
              }
              , Promise.resolve(true)
            )
          }

          return { result, credentials, dids, entity }
        }
      }
    },

    verifyChain: async (
      chain: DIDDocument[],
      options: {
        did: DIDDocument,
        capability?: CapabilityCredential
      }
    ) => {
      return await chain.reduce(async (result, did) => {
        if (!await result) {
          return false
        }
        /**
         * @PROCEED
         * @TODO
         * Rebuild chain with direct (non recursive) case logic
         * and verify it appropriatly
         */
        if(options.capability && did.id === options.capability.id) {
          const didVerificationResult = await wallet.did.helper().verifyDID(did) 
          debugger
          const [credentialVerificationResult, info] = await wallet.ssi.verifyCredential(
            options.capability, did,
            did?.verificationMethod && did.verificationMethod?.length > 1 
              ? VERIFICATION_KEY_CONTROLLER
              : VERIFICATION_KEY_HOLDER
          )
          if (!credentialVerificationResult) {
            console.log(info)
          }
          options.did = did
          return didVerificationResult && credentialVerificationResult
        }
        if ([REGISTRY_SECTION_PEER, REGISTRY_SECTION_OWN].map(
          section => wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential<
            IdentitySubject, Identity<IdentitySubject>
          >(did.id, section)?.credential
        ).find(id => id)) {
          options.did = did
          return true
        }
        if (await wallet.did.helper().verifyDID(did)) {
          if (options.did.alsoKnownAs && options.did.alsoKnownAs.includes(did.id)) {
            if (did.capabilityDelegation) {
              if (did.capabilityDelegation.find(
                tmp => {
                  const controller = wallet.did.helper().extractProofController(options.did)
                  return controller ===
                    (typeof tmp === 'string'
                      ? wallet.did.helper().parseDIDId(tmp).did
                      : tmp.controller)
                }
              )) {
                options.did = did
                return true
              }

              return false
            }
          }
          if (did.capabilityInvocation) {
            if (did.capabilityInvocation.find(
              tmp => {
                const controller = wallet.did.helper().extractProofController(
                  options.did, VERIFICATION_KEY_HOLDER
                )
                return controller ===
                  (typeof tmp === 'string'
                    ? wallet.did.helper().parseDIDId(tmp).did
                    : tmp.controller)
              }
            )) {
              options.did = did
              return true
            }

            return false
          }
        }

        return false
      }, Promise.resolve(true))
    }
  }

  return _helper
}