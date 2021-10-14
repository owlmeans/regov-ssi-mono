
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

                if (satellite.credentialSubject.data.capabilities) {
                  const chain = [...satellite.credentialSubject.data.chain]
                  for (let cap of satellite.credentialSubject.data.capabilities) {
                    const didIdx = chain.findIndex(did => did.id === cap.id)
                    const [did] = chain.splice(didIdx, 1)
                    const [result, info] = await wallet.ssi.verifyCredential(cap, did)
                    if (!result) {
                      console.log(info)
                      return false
                    }
                  }
                  /**
                   * @TODO Actually we verify here only last credential 
                   * in the chain. It's not OK. The whole chain should
                   * be checked.
                   * 
                   * Proper way is to restructurize the whole structure and 
                   * do not try to chain only dids. The whole credential
                   * sequence should be presented via some satellite mechanism.
                   */
                  return await _helper.verifyChain([chain[chain.length - 1]])
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
      chain: DIDDocument[], options?: { noFirst?: boolean }
    ): Promise<boolean> => {
      const _chain = [...chain]
      if (_chain.length < 1 && !options?.noFirst) {
        return false
      }
      const did = _chain.shift()
      if (!did) {
        return false
      }

      if (![REGISTRY_SECTION_PEER, REGISTRY_SECTION_OWN].map(
        section => wallet.getRegistry(REGISTRY_TYPE_IDENTITIES).getCredential<
          IdentitySubject, Identity<IdentitySubject>
        >(did.id, section)?.credential
      ).find(id => id)) {
        return false
      }

      if (_chain.length > 0) {
        return _helper.verifyChain(_chain, {
          ...options,
          noFirst: true
        })
      }

      return true
    }
  }

  return _helper
}