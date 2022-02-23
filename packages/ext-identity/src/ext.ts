import {
  addObserverToSchema, buildExtension, buildExtensionSchema, ExtensionDetails, defaultBuildingFactory,
  EXTENSION_TRIGGER_AUTHENTICATED, EXTENSION_TRIGGER_RETRIEVE_NAME, RetreiveNameEventParams,
} from "@owlmeans/regov-ssi-extension"
import { CredentialSubject, getCompatibleSubject, REGISTRY_TYPE_IDENTITIES, UnsignedCredential } from "@owlmeans/regov-ssi-core"
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
      mandatoryTypes: [BASIC_IDENTITY_TYPE],
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

  schema = addObserverToSchema(schema, {
    filter: async wallet => !wallet.hasIdentity(),
    trigger: EXTENSION_TRIGGER_AUTHENTICATED
  })

  schema = addObserverToSchema(schema, {
    trigger: EXTENSION_TRIGGER_RETRIEVE_NAME,
    filter: async (_, params: RetreiveNameEventParams) => {
      if (!params.credential.type || !Array.isArray(params.credential.type)) {
        return false
      }
  
      return params.credential.type.includes(identityType)
    },
    
    method: async (_, { credential, setName }: RetreiveNameEventParams) => {
      const subject = getCompatibleSubject<IdentitySubject>(credential)
      setName(`ID: ${subject.identifier}`)
    }
  })

  const extension = buildExtension<IdentityCredentials>(schema, {
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
        
        const unsigned = await defaultBuildingFactory(credSchema)(wallet, {
          ...params, subjectData: updatedSubjectData
        })

        updatedSubjectData.identifier = credIdToIdentityId(wallet, unsigned)

        return unsigned as unknown as UnsignedCredential
      }
    }
  })

  return extension
}

export type BuildExtensionParams = {
  appName: string
}