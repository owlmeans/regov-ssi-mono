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

import {
  addObserverToSchema, buildExtension, buildExtensionSchema, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED,
  IncommigDocumentEventParams
} from "@owlmeans/regov-ssi-core"
import {
  BASIC_IDENTITY_TYPE, RegovSignatureCredential, REGOV_CLAIM_TYPE_SIGNATURE, REGOV_CREDENTIAL_TYPE_SIGNATURE,
  REGOV_EXT_SIGNATURE_NAMESPACE, REGOV_SIGNATURE_REQUEST_TYPE, REGOV_SIGNATURE_RESPONSE_TYPE
} from "./types"
import { isCredential, isPresentation, REGISTRY_TYPE_CREDENTIALS, REGISTRY_TYPE_REQUESTS } from "@owlmeans/regov-ssi-core"
import enCommon from './i18n/en/common.json'
import { normalizeValue } from "@owlmeans/regov-ssi-core"


let signatureExtensionSchema = buildExtensionSchema<RegovSignatureCredential>({
  name: 'extension.details.name',
  code: 'owlmean-regov-doc-signature',
  types: {
    claim: REGOV_CLAIM_TYPE_SIGNATURE
  }
}, {
  [REGOV_CREDENTIAL_TYPE_SIGNATURE]: {
    mainType: REGOV_CREDENTIAL_TYPE_SIGNATURE,
    defaultNameKey: 'cred.signature.name',
    contextUrl: 'https://owlmeans.com/schema/doc-signature',
    credentialContext: {
      '@version': 1.1,
      name: "http://www.w3.org/2001/XMLSchema#string",
      description: "http://www.w3.org/2001/XMLSchema#string",
      documentHash: "http://www.w3.org/2001/XMLSchema#string",
      docType: "http://www.w3.org/2001/XMLSchema#string",
      filename: "http://www.w3.org/2001/XMLSchema#string",
      url: "http://www.w3.org/2001/XMLSchema#string",
      creationDate: "http://www.w3.org/2001/XMLSchema#datetime",
      version: "http://www.w3.org/2001/XMLSchema#string",
      author: "http://www.w3.org/2001/XMLSchema#string",
      authorId: "http://www.w3.org/2001/XMLSchema#string",
      signedAt: "http://www.w3.org/2001/XMLSchema#datetime",
    },
    evidence: {
      type: BASIC_IDENTITY_TYPE,
      signing: true,
    },
    requestType: REGOV_SIGNATURE_REQUEST_TYPE,
    registryType: REGISTRY_TYPE_CREDENTIALS,
    selfIssuing: true,
    claimable: false,
    listed: true,
  },
  [REGOV_SIGNATURE_REQUEST_TYPE]: {
    mainType: REGOV_SIGNATURE_REQUEST_TYPE,
    requestType: REGOV_SIGNATURE_REQUEST_TYPE,
    mandatoryTypes: [REGOV_CREDENTIAL_TYPE_SIGNATURE],
    defaultNameKey: 'request.signature.name',
    contextUrl: 'https://owlmeans.com/schema/doc-signature-request',
    credentialContext: {
      '@version': 1.1,
      description: "http://www.w3.org/2001/XMLSchema#string",
      documentHash: "http://www.w3.org/2001/XMLSchema#string",
      url: "http://www.w3.org/2001/XMLSchema#string",
      version: "http://www.w3.org/2001/XMLSchema#string",
      authorId: "http://www.w3.org/2001/XMLSchema#string",
    },
    registryType: REGISTRY_TYPE_REQUESTS,
    selfIssuing: true,
    claimable: false,
    listed: true,
  },
  [REGOV_SIGNATURE_RESPONSE_TYPE]: {
    mainType: REGOV_SIGNATURE_RESPONSE_TYPE,
    responseType: REGOV_SIGNATURE_RESPONSE_TYPE,
    credentialContext: {}
  }
})

signatureExtensionSchema = addObserverToSchema(signatureExtensionSchema, {
  trigger: EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED,
  filter: async (_, params: IncommigDocumentEventParams) => {
    if (isCredential(params.credential)) {
      return normalizeValue(params.credential.type).includes(REGOV_CREDENTIAL_TYPE_SIGNATURE)
    }

    if (isPresentation(params.credential)) {
      return normalizeValue(params.credential.type).includes(REGOV_SIGNATURE_REQUEST_TYPE)
        || normalizeValue(params.credential.type).includes(REGOV_SIGNATURE_RESPONSE_TYPE)
    }

    return false
  }
})

export const signatureExtension = buildExtension(
  signatureExtensionSchema, {
  [REGOV_CREDENTIAL_TYPE_SIGNATURE]: {},
  [REGOV_SIGNATURE_REQUEST_TYPE]: {},
  [REGOV_SIGNATURE_RESPONSE_TYPE]: {}
})
signatureExtension.localization = {
  ns: REGOV_EXT_SIGNATURE_NAMESPACE,
  translations: {
    en: enCommon
  }
}
