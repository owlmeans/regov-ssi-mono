import {
  addObserverToSchema,
  buildExtension,
  buildExtensionSchema,
  ExtensionDetails,
  EXTESNION_TRIGGER_AUTHENTICATED,
  defaultBuildingFactory,
} from "@owlmeans/regov-ssi-extension"
import {
  CredentialSubject,
  REGISTRY_TYPE_IDENTITIES,
  UnsignedCredential
} from "@owlmeans/regov-ssi-core"
import { IdentitySubject } from "./types"
import { makeRandomUuid } from "@owlmeans/regov-ssi-common"
import { credIdToIdentityId } from "./helper"


export const BASIC_IDENTITY_TYPE = 'Identity'

export const buildIdentityExtension = (type: string, params: BuildExtensionParams, details: ExtensionDetails) => {
  const identityType = type || 'OwlMeans:Regov:Identity'

  type IdentityCredentials = typeof identityType

  details.defaultCredType = identityType
  let schema = buildExtensionSchema<IdentityCredentials>(details, {
    [identityType]: {
      mainType: identityType,
      mandatoryTypes: [identityType, BASIC_IDENTITY_TYPE],
      defaultNameKey: 'cred.type.identity.name',
      credentialContext: {
        '@version': 1.1,
        identifier: "http://www.w3.org/2001/XMLSchema#string",
        sourceApp: "http://www.w3.org/2001/XMLSchema#string",
        uuid: "http://www.w3.org/2001/XMLSchema#string",
        createdAt: "http://www.w3.org/2001/XMLSchema#datetime"
      },
      /**
       * @TODO Load from file. Should be a valid credential
       * with a subject that describe the way that the tested
       * credential subject should be verified.
       */
      // credentialSchema: {}
      registryType: REGISTRY_TYPE_IDENTITIES,
      claimable: false,
      listed: true,
      selfIssuing: true,
      defaultSubject: {
        sourceApp: params.appName
      } as unknown as CredentialSubject
    }
  })

  schema = addObserverToSchema<IdentityCredentials>(schema, {
    filter: async wallet => !wallet.hasIdentity(),
    trigger: EXTESNION_TRIGGER_AUTHENTICATED
  })

  return buildExtension<IdentityCredentials>(schema, {
    [identityType]: {
      buildingFactory: (credSchema) => async (wallet, params) => {
        const inputData = params.subjectData as IdentitySubject
        const updatedSubjectData = {
          ...credSchema.defaultSubject,
          ...inputData,
          createdAt: inputData.createdAt || (new Date).toISOString(),
          sourceApp: inputData.sourceApp || (credSchema.defaultSubject as any).sourceApp,
          uuid: makeRandomUuid()
        }
        
        updatedSubjectData.createdAt = (new Date).toISOString()

        const unsigned = await defaultBuildingFactory(credSchema)(wallet, {
          ...params, subjectData: updatedSubjectData
        })

        updatedSubjectData.identifier = credIdToIdentityId(wallet, unsigned)

        return unsigned as unknown as UnsignedCredential
      }
    }
  })
}

export type BuildExtensionParams = {
  appName: string
}