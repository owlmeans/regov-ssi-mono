/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

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
    contextUrl: 'https://schema.owlmeans.com/auth.json',
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
    contextUrl: 'https://schema.owlmeans.com/auth-request.json',
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