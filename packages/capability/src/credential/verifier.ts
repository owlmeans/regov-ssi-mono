import {
  EntityIdentity,
  SatelliteCredential,
  verifierCredentialHelper
} from "@owlmeans/regov-ssi-agent"
import {
  Presentation,
  Credential,
  WalletWrapper
} from "@owlmeans/regov-ssi-core"
import { CredentialWithSource, hasCredentialSource, isCapability } from "."
import { isGovernance } from ".."


export const capabilityVerifierHelper =
  (wallet: WalletWrapper) => {
    type PresentedCredential = EntityIdentity | Credential | SatelliteCredential

    const _helper = {
      response: () => {
        const _responseHelper = {
          verifyWithSource: async (credential: CredentialWithSource): Promise<boolean> => {
            const subject = Array.isArray(credential.credentialSubject)
              ? credential.credentialSubject[0]
              : credential.credentialSubject
            if (!subject.source || !subject.sourceDid) {
              return false
            }
            const source = subject.source
            const did = subject.sourceDid
            const [result, info] = await wallet.ssi.verifyCredential(source, did)
            if (!result) {
              console.log('Source is supplied without verification meta-data')
              console.log(info)
              return false
            }
            /**
             * @PROCEED
             * @TODO We should verfiy credential based on source:
             * 1. If the source is capability we need to check
             * 1.1. If the capability allows to issue this credential
             * 2. If the source is governance we need to check if:
             * 2.1. If the credential is governance we need to check if source is allowed to delegate
             * 2.2. If the credential is capability we need to check if source is allowrd to provide
             *      this capability.
             * 2.3. If the credential is a random credential we need to check if source is allowed
             *      to provide random crednetials.
             */
            if (isGovernance(credential)) {
              if (isGovernance(source)) {
                return _responseHelper.verifyWithSource(source)
              }
              const [result, info] = await wallet.ssi.verifyCredential(source)
              if (!result) {
                console.log(info)
              }

              return result
            } else if (isCapability(credential)) {

            } else {

            }

            return false
          },

          verify: async (presentation: Presentation<PresentedCredential>) => {
            const { result, credentials, dids, entity } = await verifierCredentialHelper(wallet)
              .response().verify(presentation)

            if (result && credentials) {
              return await (credentials as Credential[]).reduce(
                async (result: Promise<boolean>, credential: Credential) => {
                  if (!await result) {
                    return false
                  }
                  if (hasCredentialSource(credential)) {
                    return _responseHelper.verifyWithSource(credential)
                  }

                  return true
                },
                Promise.resolve(true)
              )
            }

            return result
          }
        }

        return _responseHelper
      }
    }

    return _helper
  }