import {
  EntityIdentity,
  SatelliteCredential,
  verifierCredentialHelper
} from "@owlmeans/regov-ssi-agent"
import { isIdentity } from "@owlmeans/regov-ssi-agent/src"
import {
  Presentation,
  Credential,
  WalletWrapper,
  REGISTRY_TYPE_IDENTITIES,
  REGISTRY_SECTION_PEER
} from "@owlmeans/regov-ssi-core"
import {
  DIDDocumentWrapper,
  VERIFICATION_KEY_HOLDER,
  WRAPPER_SOURCE_PEER_ID
} from "@owlmeans/regov-ssi-did"
import {
  CredentialWithSource,
  hasCredentialSource,
  isCapability
} from "./types"


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
            if (isCapability(source)) {
              const schema = source.credentialSubject.schema ?
                Array.isArray(source.credentialSubject.schema)
                  ? source.credentialSubject.schema
                  : [source.credentialSubject.schema]
                : []
              if (schema.find(
                schema => {
                  const type = Array.isArray(schema.type) ? schema.type : [schema.type]
                  return type.includes('*') || type.every(type => credential.type.includes(type))
                }
              )) {
                const purpose = wallet.did.helper()
                  .expandVerificationMethod(did, 'capabilityInvocation', VERIFICATION_KEY_HOLDER)
                if (purpose && credential.issuer === did.id) {
                  return _responseHelper.verifyWithSource(source)
                }
                console.log('Source capability doesn\t have rights to invoke credentials')
              }
              console.log('Source capability can\'t genereate this credential')
            } else if (isIdentity(source)) {
              const peerDid = await wallet.did.lookUpDid<DIDDocumentWrapper>(did.id, true)
              const trustedIdentity = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
                .getCredential(source.id, REGISTRY_SECTION_PEER)
              if (trustedIdentity?.credential && peerDid?.source === WRAPPER_SOURCE_PEER_ID) {
                return true
              }
              console.log('Untrusted identity at the end of trust chain')
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