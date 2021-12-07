import {
  buildExtensionSchema,
  ExtensionDetails
} from "../../schema"
import { 
  buildExtension, 
  Extension 
} from "../../ext"
import { REGISTRY_TYPE_CREDENTIALS } from "@owlmeans/regov-ssi-core"


export const buildUniversalExtension = (details: ExtensionDetails) =>
  buildExtension<UniversalCredentialT>(buildExtensionSchema(
    details,
    {
      [UNIVERSAL_EXTENSION_CRED_TYPE]: {
        mainType: UNIVERSAL_EXTENSION_CRED_TYPE,
        credentialContext: {
          '@version': 1.1,
          scm: `${details.schemaBaseUrl}/ssi/schema/universal`,
          data: { '@id': 'scm:data', '@type': '@json' }
        },
        registryType: REGISTRY_TYPE_CREDENTIALS,
        claimable: true,
        listed: true,
        selfIssuing: true
      }
    }
  )) as UniversalCredentailExtension

export const UNIVERSAL_EXTENSION_CRED_TYPE = 'UniversalCredential'

export type UniversalCredentialT = typeof UNIVERSAL_EXTENSION_CRED_TYPE

export type UniversalCredentailExtension = Extension<UniversalCredentialT>