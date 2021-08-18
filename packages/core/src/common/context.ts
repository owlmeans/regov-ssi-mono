
import { buildVCV1, buildVCV1Skeleton, buildVCV1Unsigned, validateVCV1 } from "@affinidi/vc-common";

import { BuildCommonContextMethod, CommonBuildCredentailOptions, CommonSignCredentialOptions, COMMON_CONTROLLER_ROLE_HOLDER } from "./types";
import { CommonCredentail, CommonCredentailSubject, CommonSubjectType, CommonUnsignedCredential } from "./types/credential";
import { CryptoKey } from "metabelarusid-common"

export const buildCommonContext: BuildCommonContextMethod = async ({
  keys,
  crypto
}) => {
  const documentLoader = async (url: string): Promise<any> => {
    if (url.startsWith('did:')) {
      // @TODO Fix lookup by did for metabelarus purpose
      throw new SyntaxError('Can\'t look up did based urls fore documents')
      return {
        contextUrl: null,
        document: {},
        documentUrl: url,
      }
    }

    const jsonld = require('jsonld')

    return jsonld.documentLoaders.node()(url)
  }

  return {
    keys,

    crypto,

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
        context: options.context
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
      key: CryptoKey,
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
          getSignSuite: (options) => crypto.buildSignSuite({
            publicKey: <string>options.publicKey,
            privateKey: options.privateKey,
            id: options.keyId,
            controller: options.controller
          }),
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
    },

    verifyCredential: async (credential) => {
      validateVCV1({
        getVerifySuite: crypto.buildVerifySuite,
        documentLoader,
        getProofPurposeOptions: (async () => ({
          controller: { id: credential.holder.id }
        }))
      })

      return true
    }
  }
}