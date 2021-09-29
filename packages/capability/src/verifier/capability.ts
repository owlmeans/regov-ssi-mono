
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
  Credential
} from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-did"
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
                      satellite.credentialSubject.data.did
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

    verifyChain: async (chain: DIDDocument[], did: DIDDocument) => {
      return await chain.reduce(async (result, _did) => {
        if (!await result) {
          return false
        }
        if (await wallet.did.helper().verifyDID(_did)) {
          if (did.alsoKnownAs && did.alsoKnownAs.includes(_did.id)) {
            if (_did.capabilityDelegation) {
              if (_did.capabilityDelegation.find(
                tmp => wallet.did.helper().extractProofController(did)
                  === (
                    typeof tmp === 'string'
                      ? wallet.did.helper().parseDIDId(tmp).did
                      : tmp.controller
                  )
              )) {
                did = _did
                return true
              }

              return false
            }
          }
          if (_did.capabilityInvocation) {
            if (_did.capabilityInvocation.find(
              tmp => wallet.did.helper().extractProofController(did)
                === (
                  typeof tmp === 'string'
                    ? wallet.did.helper().parseDIDId(tmp).did
                    : tmp.controller
                )
            )) {
              did = _did
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