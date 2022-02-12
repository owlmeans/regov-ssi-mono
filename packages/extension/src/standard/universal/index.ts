import { buildExtensionSchema, ExtensionDetails } from "../../schema"
import {  buildExtension } from "../../ext"
import { REGISTRY_TYPE_CREDENTIALS } from "@owlmeans/regov-ssi-core"


export const buildUniversalExtension = (details: ExtensionDetails) =>
  buildExtension<UniversalCredentialT>(buildExtensionSchema(
    { 
      ...details,
      types: {
        claim: UNIVERSAL_EXTENSION_CLAIM_TYPE,
        offer: UNIVERSAL_EXTENSION_OFFER_TYPE,
        ...(details.types || {})
      }
    },
    {
      [UNIVERSAL_EXTENSION_CRED_TYPE]: {
        mainType: UNIVERSAL_EXTENSION_CRED_TYPE,
        defaultNameKey: 'extension.details.cred.universal.name',
        credentialContext: {
          '@version': 1.1,
          scm: `${details.schemaBaseUrl}/ssi/schema/universal`,
        },
        registryType: REGISTRY_TYPE_CREDENTIALS,
        claimable: true,
        listed: true,
        selfIssuing: true
      }
    }
  ))

export const UNIVERSAL_EXTENSION_CRED_TYPE = 'UniversalCredential'

export const UNIVERSAL_EXTENSION_CLAIM_TYPE = 'UniversalClaim'

export const UNIVERSAL_EXTENSION_OFFER_TYPE = 'UniversalOffer'

export type UniversalCredentialT = typeof UNIVERSAL_EXTENSION_CRED_TYPE
