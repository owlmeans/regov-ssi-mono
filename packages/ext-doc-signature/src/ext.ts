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
  BASIC_IDENTITY_TYPE, RegovSignatureCredential, REGOV_CLAIM_PRESONALID, REGOV_CLAIM_TYPE_SIGNATURE, REGOV_CREDENTIAL_TYPE_SIGNATURE,
  REGOV_CRED_PERSONALID,
  REGOV_EXT_SIGNATURE_NAMESPACE, REGOV_OFFER_PRESONALID, REGOV_OFFER_TYPE_SIGNATURE, REGOV_SIGNATURE_REQUEST_TYPE, REGOV_SIGNATURE_RESPONSE_TYPE
} from "./types"
import { isCredential, isPresentation, REGISTRY_TYPE_CREDENTIALS, REGISTRY_TYPE_REQUESTS } from "@owlmeans/regov-ssi-core"
import enCommon from './i18n/en/common.json'
import ruCommon from './i18n/ru/common.json'
import byCommon from './i18n/by/common.json'
import { normalizeValue } from "@owlmeans/regov-ssi-core"


let signatureExtensionSchema = buildExtensionSchema<RegovSignatureCredential>({
  name: 'extension.details.name',
  code: 'owlmeans-regov-doc-signature',
  types: {
    claim: REGOV_CLAIM_TYPE_SIGNATURE,
    offer: REGOV_OFFER_TYPE_SIGNATURE
  }
}, {
  [REGOV_CREDENTIAL_TYPE_SIGNATURE]: {
    mainType: REGOV_CREDENTIAL_TYPE_SIGNATURE,
    defaultNameKey: 'cred.signature.name',
    contextUrl: 'https://schema.owlmeans.com/doc-signature.json',
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
    listed: true
  },
  [REGOV_SIGNATURE_REQUEST_TYPE]: {
    mainType: REGOV_SIGNATURE_REQUEST_TYPE,
    requestType: REGOV_SIGNATURE_REQUEST_TYPE,
    mandatoryTypes: [REGOV_CREDENTIAL_TYPE_SIGNATURE],
    defaultNameKey: 'request.signature.name',
    contextUrl: 'https://schema.owlmeans.com/doc-signature-request.json',
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
  },
  [REGOV_CRED_PERSONALID]: {
    mainType: REGOV_CRED_PERSONALID,
    mandatoryTypes: [REGOV_CREDENTIAL_TYPE_SIGNATURE],
    defaultNameKey: 'std.personalid.label',
    contextUrl: 'https://schema.owlmeans.com/std/personal-id.json',
    credentialContext: {
      '@version': 1.1,
      scm: 'https://schema.org/Person',
      scma: 'https://schema.org/GovernmentPermit',
      addr: 'https://schema.org/PostalAddress',
      name: { '@id': 'scma:name', '@type': 'scma:name' },
      identifier: { '@id': 'scma:identifier', '@type': 'scma:identifier' },
      country: { '@id': 'addr:addressCountry', '@type': 'addr:addressCountry' },
      gender: { '@id': 'scm:gender', '@type': 'scm:gender' },
      givenName: { '@id': 'scm:givenName', '@type': 'scm:givenName' },
      familyName: { '@id': 'scm:familyName', '@type': 'scm:familyName' },
      additionalName: { '@id': 'scm:additionalName', '@type': 'scm:additionalName' },
      birthDate: { '@id': 'scm:birthDate', '@type': 'scm:birthDate' },
      validFrom: {'@id': 'scma:validFrom', '@type': 'scma:validFrom'},
      validUntil: {'@id': 'scma:validUntil', '@type': 'scma:validUntil'}
    },
    registryType: REGISTRY_TYPE_CREDENTIALS,
    claimType: REGOV_CLAIM_PRESONALID,
    offerType: REGOV_OFFER_PRESONALID,
    selfIssuing: false,
    claimable: true,
    listed: true,
    arbitraryEvidence: true
  },
  [REGOV_CLAIM_PRESONALID]: {
    mainType: REGOV_CLAIM_PRESONALID,
    credentialContext: {}
  },
  [REGOV_OFFER_PRESONALID]: {
    mainType: REGOV_OFFER_PRESONALID,
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
  [REGOV_SIGNATURE_RESPONSE_TYPE]: {},
  [REGOV_CRED_PERSONALID]: {},
  [REGOV_CLAIM_PRESONALID]: {},
  [REGOV_OFFER_PRESONALID]: {}
})
signatureExtension.localization = {
  ns: REGOV_EXT_SIGNATURE_NAMESPACE,
  translations: {
    en: enCommon,
    ru: ruCommon,
    be: byCommon
  }
}
