
import { buildVCV1, buildVCV1Skeleton, buildVCV1Unsigned, getVCV1JSONContext } from "@affinidi/vc-common";
import { Credential } from "credential/types";
import { KeyChainWrapper } from "keys/types";
import { cryptoHelper } from "./crypto/helper";

import { BuildCommonContextMethod, CommonBuildCredentailOptions, CommonSignCredentialOptions, CommonBuildSignSuiteMethod, COMMON_CONTROLLER_ROLE_HOLDER } from "./types";
import { CommonCredentail, CommonCredentailSubject, CommonSubjectType, CommonUnsignedCredential } from "./types/credential";
import { CommonKey } from "./types/key";

export const buildCommonContext: BuildCommonContextMethod = async (
  keyChain: KeyChainWrapper
) => {

  const buildSignSuite: CommonBuildSignSuiteMethod = ({ keyId, privateKey, publicKey, controller }) => {
    return cryptoHelper.buildSignSignature({
      id: keyId,
      controller,
      privateKeyHex: Buffer.from(privateKey, 'base64').toString('hex'),
      publicKeyHex: Buffer.from(<string>publicKey, 'base64').toString('hex')
    })
  }

  const documentLoader = async (url: string): Promise<any> => {
    if (url.startsWith('did:')) {
      return {
        contextUrl: null,
        // document: didDoc,
        documentUrl: url,
      }
    }

    const jsonld = require('jsonld')

    return jsonld.documentLoaders.node()(url)
  }

  return {
    keyChain,

    buildSignSuite,

    buildCredential: async <
      T extends CommonSubjectType = CommonSubjectType,
      S extends CommonCredentailSubject<T> = CommonCredentailSubject<T>
    >(options: CommonBuildCredentailOptions<T>) => {
      const skeleton = buildVCV1Skeleton({
        id: options.id,
        type: options.type,
        credentialSubject: options.subject,
        holder: {
          id: options.holder
        },
        context: {
          '@version': 1.1,
          meta: 'https://meta-id.meta-belarus.org/vc-schema#',
          data: {
            '@id': 'meta:data',
            '@type': '@id',
            '@context': {
              worker: { '@id': 'meta:worker', '@type': 'xsd:string' }
            }
          }
        }
      })

      return buildVCV1Unsigned({
        skeleton,
        issuanceDate: options.issueanceDate || (new Date).toISOString()
      }) as CommonUnsignedCredential<S>
    },

    signCredential: async <
      S extends CommonCredentailSubject = CommonCredentailSubject
    >(
      unsingedCredential: CommonUnsignedCredential<S>,
      issuer: string,
      key: CommonKey,
      options?: CommonSignCredentialOptions
    ) => {
      try {
        return await buildVCV1({
          unsigned: unsingedCredential,
          issuer: {
            did: issuer,
            keyId: key.id,
            privateKey: key.pk,
            publicKey: key.pubKey
          },
          getSignSuite: buildSignSuite,
          documentLoader,
          getProofPurposeOptions: options?.buildProofPurposeOptions || (async () => ({
            controller: {
              id: !options?.controllerRole || options.controllerRole
                === COMMON_CONTROLLER_ROLE_HOLDER ? unsingedCredential.holder.id : issuer
            }
          }))
        }) as CommonCredentail<S>
      } catch (e) {
        console.log(e.details)

        throw e
      }
    }
  }
}