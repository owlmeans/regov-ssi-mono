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
  CredentialDescription, Extension, ExtensionSchema, MultiSchema, buildExtension, META_ROLE_CREDENTIAL, META_ROLE_CLAIM, META_ROLE_OFFER, META_ROLE_REQUEST, META_ROLE_RESPONSE
} from "@owlmeans/regov-ssi-core"
import { CustomDescription, DefaultSubject, isCustom } from "../custom.types"
import { castClaimType, castOfferType, castRequestType, castResponseType } from "./tools"


export const addCredential = (schema: ExtensionSchema, cred: Omit<CustomDescription, "customExtFlag">): ExtensionSchema => {
  return {
    ...schema,
    credentials: {
      ...schema.credentials,
      ...produceTypes(schema, { ...cred, customExtFlag: true })
    }
  }
}

export const updateFactories = (ext: Extension): Extension => {
  ext.factories = {
    ...ext.factories,
    ...buildExtension(ext.schema, (ext.schema.credentials ? Object.fromEntries(
      Object.entries(ext.schema.credentials).flatMap(
        ([type, descr]) => isCustom(descr) ? [
          [type, {}],
          [castClaimType(descr), {}],
          [castOfferType(descr), {}],
          [castRequestType(descr), {}],
          [castResponseType(descr), {}]
        ] : []
      )
    ) : {})).factories
  }

  return ext
}

const produceTypes = (schema: ExtensionSchema, cred: CustomDescription): { [key: string]: CredentialDescription } => {
  const claimType = castClaimType(cred)
  const offerType = castOfferType(cred)
  const requestType = castRequestType(cred)
  const responseType = castResponseType(cred)

  return {
    [cred.mainType]: expandType(schema, {...cred, metaRole: META_ROLE_CREDENTIAL}),
    [claimType]: /*expandType(schema,*/ { 
      mainType: claimType, metaRole: META_ROLE_CLAIM, sourceType: cred.mainType, credentialContext: {} 
    },//),
    [offerType]: /*expandType(schema,*/ { 
      mainType: offerType, metaRole: META_ROLE_OFFER, sourceType: cred.mainType, credentialContext: {} 
    },//),
    [requestType]: /*expandType(schema,*/ { 
      mainType: requestType, metaRole: META_ROLE_REQUEST, sourceType: cred.mainType, credentialContext: {} 
    },//),
    [responseType]: /*expandType(schema,*/ { 
      mainType: responseType, metaRole: META_ROLE_RESPONSE, sourceType: cred.mainType, credentialContext: {} 
    },//),
  }
}

const expandType = (
  schema: ExtensionSchema, cred: CustomDescription<DefaultSubject> | CredentialDescription
): CredentialDescription => {
  return {
    claimType: castClaimType(cred),
    offerType: castOfferType(cred),
    ...(schema.credentials && schema.credentials[cred.mainType] || {}),
    ...cred, credentialContext: {
      ...cred.credentialContext,
      ...(isCustom(cred) ? Object.fromEntries(
        Object.entries(cred.subjectMeta).filter(([, field]) => field.term).map(
          ([key, field]) => [key, field.term]
        )
      ) as MultiSchema : {})
    },
  }
}