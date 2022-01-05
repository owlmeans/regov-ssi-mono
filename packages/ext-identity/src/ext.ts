import {
  addObserverToSchema,
  buildExtension,
  buildExtensionSchema,
  ExtensionDetails,
  EXTESNION_TRIGGER_AUTHENTICATED
} from "@owlmeans/regov-ssi-extension"
import { 
  REGISTRY_TYPE_IDENTITIES
} from "@owlmeans/regov-ssi-core"


export const BASIC_IDENTITY_TYPE = 'Identity'

export const buildIdentityExtension = (type: string, details: ExtensionDetails) => {
  const identityType = type || 'OwlMeans:Regov:Identity'

  type IdentityCredentials = typeof identityType

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
    }
  })

  schema = addObserverToSchema<IdentityCredentials>(schema, {
    filter: async (_) => {
      return true
    },
    trigger: EXTESNION_TRIGGER_AUTHENTICATED
  })

  return buildExtension<IdentityCredentials>(schema)
}