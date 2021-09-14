import {
  DIDDocument,
} from "@owlmeans/regov-ssi-did"
import { identityHelper } from "../wallet/identity"
import {
  Credential,
  BASE_CREDENTIAL_TYPE,
  UnsignedPresentation,
  Presentation
} from "../credential/types"
import { WalletWrapper } from "../wallet/types"
import { KeyPair } from "../keys/types"
import {
  REGISTRY_TYPE_REQUESTS
} from "../wallet/registry/types"
import { EntityIdentity, IdentityParams } from "../wallet/identity/types"
import { CredentialRequestSubjectType, ERROR_NO_IDENTITY_TO_VERIFY_CREDENTIAL, RequestBundle } from "./types"
import {
  CREDENTIAL_RESPONSE_TYPE,
  ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL,
  ERROR_UNTUSTED_ISSUER,
  SatelliteCredential
} from "../holder/types"
import {
  CREDENTIAL_REQUEST_TYPE,
  ERROR_REQUEST_RESPONSE_DONT_MATCH,
  RequestCredential,
  RequestSubject
} from "./types"
import { basicHelper } from "@owlmeans/regov-ssi-common"
import { isSatellite } from "../holder/credential"


export const verifierCredentialHelper = (wallet: WalletWrapper) => {
  const _identityHelper = identityHelper(wallet)

  return {
    request: (verifier?: DIDDocument) => {
      return {
        build: async (request: CredentialRequestSubjectType, key?: string | KeyPair) => {
          const requestSubject = { data: request }

          verifier = verifier || _identityHelper.getIdentity().did
          if (!verifier) {
            throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
          }
          const cryptoKey = await wallet.keys.getCryptoKey(key)
          const id = wallet.did.helper().makeDIDId(cryptoKey, {
            data: JSON.stringify(requestSubject),
            hash: true
          })

          const unsigned = await wallet.ctx.buildCredential({
            id: id,
            type: [BASE_CREDENTIAL_TYPE, CREDENTIAL_REQUEST_TYPE],
            holder: wallet.did.helper().extractProofController(verifier),
            context: wallet.ctx.buildLDContext(
              'credential/request'
            ),
            subject: requestSubject
          })

          return await wallet.ctx.signCredential(unsigned, verifier) as RequestCredential
        },

        bundle: async (
          requests: RequestCredential[],
          identity?: IdentityParams | EntityIdentity | boolean,
          options?: { domain?: string, challenge?: string, type?: string | string[] }
        ) => {
          requests = [...requests]
          const entity = await _identityHelper.attachEntity(requests, identity)
          verifier = verifier || entity
          if (!verifier) {
            throw Error(ERROR_NO_IDENTITY_TO_SIGN_CREDENTIAL)
          }

          const unsigned = await wallet.ctx.buildPresentation(
            requests,
            {
              holder: verifier.id,
              type: [
                CREDENTIAL_REQUEST_TYPE,
                ...(options?.type
                  ? Array.isArray(options?.type)
                    ? options.type : [options?.type]
                  : []
                )
              ]
            }
          ) as UnsignedPresentation<RequestCredential>

          return await wallet.ctx.signPresentation(
            unsigned, verifier, {
            challange: options?.challenge || wallet.ctx.crypto.hash(basicHelper.makeRandomUuid()),
            domain: options?.domain
          }) as RequestBundle
        },

        /**
         * @TODO Allow to clean up registered request
         */
        register: async (bundle: RequestBundle) => {
          return await wallet.getRegistry(REGISTRY_TYPE_REQUESTS)
            .addCredential<RequestSubject, RequestBundle>(bundle)
        }
      }
    },

    response: () => ({
      verify: async <CredentialT extends Credential>(
        presentation: Presentation<CredentialT>, type?: string
      ) => {
        const offers = [...presentation.verifiableCredential]
        const entity = _identityHelper.extractEntity(offers)

        const did = entity?.credentialSubject.did
        if (!did || !await wallet.did.helper().verifyDID(did)) {
          throw new Error(ERROR_UNTUSTED_ISSUER)
        }

        let [result] = await wallet.ctx.verifyPresentation(presentation, did)

        result = result && presentation.type.includes(type || CREDENTIAL_RESPONSE_TYPE)

        const { credentials, dids } = presentation.verifiableCredential.reduce(
          (result, credential) => {
            if (isSatellite(credential)) {
              result.dids.push(credential)
            } else {
              result.credentials.push(credential)
            }

            return result
          }, { credentials: [], dids: [] } as {
            credentials: CredentialT[],
            dids: SatelliteCredential[]
          }
        )

        const request = wallet.getRegistry(REGISTRY_TYPE_REQUESTS)
          .getCredential<RequestSubject, RequestBundle>(presentation.id)
        if (result && request) {
          result = false
          if (request.credential.verifiableCredential.length === credentials.length) {
            result = request.credential.verifiableCredential.reduce<boolean>(
              (result, { credentialSubject: { data: request } }) => {
                if (!result) {
                  return false
                }
                const types: string[] = Array.isArray(request["@type"])
                  ? request["@type"] : [request["@type"]]
                return -1 < credentials.findIndex(
                  credential => types.every(type => credential.type.includes(type))
                    && (!request.issuer || request.issuer === credential.issuer)
                    && (!request.holder || request.holder === credential.holder.id)
                  /**
                   * @TODO Verify issuer capabilities
                   */
                )
              }, true
            )
          }
          if (!result) {
            console.log(ERROR_REQUEST_RESPONSE_DONT_MATCH)
          }
        }

        return { result, credentials, dids, entity }
      }
    })
  }
}