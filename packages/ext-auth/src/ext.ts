import { buildExtension, buildExtensionSchema } from "@owlmeans/regov-ssi-core"
import { en } from "./i18n"
import {
  BASIC_IDENTITY_TYPE, REGOV_AUTH_REQUEST_TYPE, REGOV_AUTH_RESPONSE_TYPE,
  REGOV_CREDENTIAL_TYPE_AUTH, REGOV_EXT_ATUH_NAMESPACE
} from "./types"


let authExtensionSchema = buildExtensionSchema({
  name: 'extension.details.name',
  code: 'owlmeans-regov-auth',
}, {
  [REGOV_CREDENTIAL_TYPE_AUTH]: {
    mainType: REGOV_CREDENTIAL_TYPE_AUTH,
    requestType: REGOV_AUTH_REQUEST_TYPE,
    responseType: REGOV_AUTH_RESPONSE_TYPE,
    defaultNameKey: 'cred.auth.name',
    contextUrl: 'https://owlmeans.com/schema/auth',
    credentialContext: {
      '@version': 1.1,
      did: "https://www.w3.org/ns/did/v1#id",
      pinCode: "http://www.w3.org/2001/XMLSchema#string",
      createdAt: "http://www.w3.org/2001/XMLSchema#datetime",
    },
    evidence: { type: BASIC_IDENTITY_TYPE, signing: true }
  },
  [REGOV_AUTH_REQUEST_TYPE]: {
    mainType: REGOV_AUTH_REQUEST_TYPE,
    requestType: REGOV_AUTH_REQUEST_TYPE,
    responseType: REGOV_AUTH_RESPONSE_TYPE,
    mandatoryTypes: [REGOV_CREDENTIAL_TYPE_AUTH],
    defaultNameKey: 'request.auth.name',
    contextUrl: 'https://owlmeans.com/schema/auth-request',
    credentialContext: {
      '@version': 1.1,
      did: "https://www.w3.org/ns/did/v1#id",
      pinCode: "http://www.w3.org/2001/XMLSchema#string",
      createdAt: "http://www.w3.org/2001/XMLSchema#datetime",
    }
  },
  [REGOV_AUTH_RESPONSE_TYPE]: {
    mainType: REGOV_AUTH_RESPONSE_TYPE,
    responseType: REGOV_AUTH_RESPONSE_TYPE,
    mandatoryTypes: [REGOV_CREDENTIAL_TYPE_AUTH],
    credentialContext: {}
  }
})


export const authExtension = buildExtension(authExtensionSchema)

authExtension.localization = {
  ns: REGOV_EXT_ATUH_NAMESPACE,
  translations: { en }
}