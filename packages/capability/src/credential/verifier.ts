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
import { ERROR_CREDENTIAL_SOURCE_UNVERIFIABLE } from "."
import {
  CredentialWithSource,
  ERROR_CREDENTIAL_DOESNTHAVE_SOURCE,
  ERROR_ROOT_SOURCE_UNTRUSTED,
  ERROR_SOURCE_CANTGENERATE_CREDENTIAL,
  ERROR_SOURCE_CANTINVOKE_CREDENTIAL,
  hasCredentialSource,
  isCapability
} from "./types"


export const capabilityVerifierHelper =
  (wallet: WalletWrapper) => {
    type PresentedCredential = EntityIdentity | Credential | SatelliteCredential

    const _helper = {
      response: () => {
        const _responseHelper = {
          verifyWithSource: async (
            credential: CredentialWithSource
          ): Promise<[boolean, string[]]> => {
            const errors: string[] = []
            const subject = Array.isArray(credential.credentialSubject)
              ? credential.credentialSubject[0]
              : credential.credentialSubject
            if (!subject.source || !subject.sourceDid) {
              errors.push(ERROR_CREDENTIAL_DOESNTHAVE_SOURCE)
              return [false, errors]
            }
            const source = subject.source
            const did = subject.sourceDid
            const [result, info] = await wallet.ssi.verifyCredential(source, did)
            if (!result) {
              errors.push(ERROR_CREDENTIAL_SOURCE_UNVERIFIABLE)
              console.log(info)
              return [false, errors]
            }
            /**
             * @TODO Verify credential with the source properly
             * 1. Verify chain
             * 2. Verify if the credential fits to some capability description
             */
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
                errors.push(ERROR_SOURCE_CANTINVOKE_CREDENTIAL)
              }
              errors.push(ERROR_SOURCE_CANTGENERATE_CREDENTIAL)
            } else if (isIdentity(source)) {
              const peerDid = await wallet.did.lookUpDid<DIDDocumentWrapper>(did.id, true)
              const trustedIdentity = wallet.getRegistry(REGISTRY_TYPE_IDENTITIES)
                .getCredential(source.id, REGISTRY_SECTION_PEER)
              if (trustedIdentity?.credential && peerDid?.source === WRAPPER_SOURCE_PEER_ID) {
                return [true, []]
              }
              errors.push(ERROR_ROOT_SOURCE_UNTRUSTED)
            }

            return [false, errors]
          },

          verify: async (presentation: Presentation<PresentedCredential>) => {
            const { result, credentials, dids, entity, errors } = await verifierCredentialHelper(wallet)
              .response().verify(presentation)

            if (result && credentials) {
              return await (credentials as Credential[])
                .reduce<Promise<[boolean, string[]]>>(
                  async (tmp, credential: Credential) => {
                    const [result, errors] = await tmp
                    if (!await result) {
                      return [false, errors]
                    }
                    if (hasCredentialSource(credential)) {
                      return _responseHelper.verifyWithSource(credential)
                    }

                    return [true, []]
                  },
                  Promise.resolve([true, []])
                )
            }

            return [result, errors]
          }
        }

        return _responseHelper
      }
    }

    return _helper
  }