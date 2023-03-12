/**
 *  Copyright 2023 OwlMeans
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
  CredentialDescription, Extension, ExtensionSchema, MultiSchema, buildExtension, META_ROLE_CREDENTIAL,
  META_ROLE_CLAIM, META_ROLE_OFFER, META_ROLE_REQUEST, META_ROLE_RESPONSE, ExtensionLocalization, normalizeValue
} from "@owlmeans/regov-ssi-core"
import { Resource, ResourceKey } from "i18next"
import { CustomDescription, DefaultSubject, isCustom, SubjectFieldMeta, SubjectMeta } from "../custom.types"
import { castSectionKey } from "../web/utils/tools"
import { castClaimType, castOfferType, castRequestType, castResponseType } from "./tools"
import merge from "lodash/fp/merge"


export const addCredential = (
  ext: Extension, cred: Omit<CustomDescription, "customExtFlag" | "ns"> & { ns?: string }
): Extension => {
  return {
    ...ext,
    schema: {
      ...ext.schema,
      credentials: {
        ...ext.schema.credentials,
        ...produceTypes(ext.schema, {
          ...cred, customExtFlag: true, ns: ext.localization?.ns || cred.ns || 'default'
        })
      }
    }
  }
}

export const addLocalization = (ext: Extension, localization: Resource): Extension => {
  return {
    ...ext,
    localization: {
      ...ext.localization,
      translations: merge(
        ext.localization?.translations
        , Object.fromEntries(Object.entries(localization).map(([ln, resource]) => {
          return [ln, merge(merge(ext.localization?.translations[ln]
            , (ext.schema.credentials
              ? Object.entries(ext.schema.credentials).map(([, cred]) => {
                if (isCustom(cred)) {
                  const sectionKey = castSectionKey(cred)
                  const translation: ResourceKey = {
                    menu: { claim: {}, request: {} },
                    [sectionKey]: {
                      claim: {
                        list: { item: { unknown: `Claim of ${cred.defaultLabel || cred.mainType} from unknown user` } }
                      },
                      offer: {
                        list: { item: { unknown: `Unknown offer of ${cred.defaultLabel || cred.mainType}` } }
                      },
                      claim_create: { title: `Create claim of ${cred.defaultLabel || cred.mainType}` },
                      claim_preview: {
                        title: `Send claim of ${cred.defaultLabel || cred.mainType}`,
                        issuer: {
                          label: 'DID of issuer',
                          hint: `Specify address of an agent, that may issue ${cred.defaultLabel || cred.mainType}`
                        },
                        send: 'Send claim'
                      },
                      claim_view: { title: `Review claim of ${cred.defaultLabel || cred.mainType}` },
                      offer_create: { title: `Create offer of ${cred.defaultLabel || cred.mainType}` },
                      offer_view: { 
                        title: `Review offer of ${cred.defaultLabel || cred.mainType}`,
                        meta_title: { default: `Credential offer: ${cred.defaultLabel || cred.mainType}` },
                      },
                      cred_view: { title: `Verifiable credential: ${cred.defaultLabel || cred.mainType}` },
                      form: {
                        offer_create: { title: `Fill issuer fields for ${cred.defaultLabel || cred.mainType}` },
                        claim_create: { title: `Fill issuer fields for ${cred.defaultLabel || cred.mainType}` },
                        offer_view: { title: `Offered verifiable credential: ${cred.defaultLabel || cred.mainType}` }
                      },
                      meta_title: {
                        label: 'Verifiable credential title',
                        hint: 'Name to list the credential in your wallet',
                      },
                      issuer: { hint: 'Select identity to sign offer' },
                      holder: { hint: 'Select holder identity' },
                      action: { close: 'Close', offer: 'Offer', claim: 'Claim', accept: 'Accept' }
                    }
                  }
                  if (cred.defaultLabel) {
                    translation.menu.claim[sectionKey] = `Claim ${cred.defaultLabel}`
                    translation.menu.request[sectionKey] = `Request ${cred.defaultLabel}`
                  }
                  Object.entries(cred.subjectMeta).forEach(([key, field]: [string, SubjectFieldMeta]) => {
                    if (field.defaultLabel) {
                      normalizeValue(field.useAt).forEach(purpose => {
                        translation[sectionKey][purpose] = translation[sectionKey][purpose] || {}
                        translation[sectionKey][purpose][key] = translation[sectionKey][purpose][key] || {}
                        translation[sectionKey][purpose][key].label = field.defaultLabel
                        translation[sectionKey][purpose][key].hint = field.defaultHint || ''
                        translation[sectionKey][purpose][key].upload = {
                          new_files: `Select files to upload for ${field.defaultLabel}`
                        }
                      })
                    }
                  })
                  return translation
                }
                return {}
              }).reduce((l10n, resource) => ({ ...l10n, ...resource }), {})
              : {})), resource)]
        }))
      )
    } as ExtensionLocalization
  }
}

export const updateFactories = (ext: Extension): Extension => {
  Object.entries(buildExtension(ext.schema, (ext.schema.credentials ? Object.fromEntries(
    Object.entries(ext.schema.credentials).flatMap(
      ([type, descr]) => isCustom(descr) ? [
        [type, {}],
        [castClaimType(descr), {}],
        [castOfferType(descr), {}],
        [castRequestType(descr), {}],
        [castResponseType(descr), {}]
      ] : []
    )
  ) : {})).factories).map(([type, factories]) => {
    ext.factories[type] = {
      ...factories,
      build: async (wallet, params) => {
        const unsigned = await factories.build(wallet, params)

        if (ext.schema.credentials && ext.schema.credentials[type]) {
          const descr = ext.schema.credentials[type]
          if (isCustom(descr) && descr.expirationPeriod) {
            const date = new Date()
            date.setSeconds(date.getSeconds() + descr.expirationPeriod)
            unsigned.expirationDate = date.toISOString()
          }
        }

        return unsigned
      }
    }
  })

  return ext
}

const produceTypes = (schema: ExtensionSchema, cred: CustomDescription): { [key: string]: CredentialDescription } => {
  const claimType = castClaimType(cred)
  const offerType = castOfferType(cred)
  const requestType = castRequestType(cred)
  const responseType = castResponseType(cred)

  return {
    [cred.mainType]: expandType(schema, { ...cred, metaRole: META_ROLE_CREDENTIAL }),
    [claimType]: {
      mainType: claimType, metaRole: META_ROLE_CLAIM, sourceType: cred.mainType, credentialContext: {}
    },
    [offerType]: {
      mainType: offerType, metaRole: META_ROLE_OFFER, sourceType: cred.mainType, credentialContext: {}
    },
    [requestType]: {
      mainType: requestType, metaRole: META_ROLE_REQUEST, sourceType: cred.mainType, credentialContext: {}
    },
    [responseType]: {
      mainType: responseType, metaRole: META_ROLE_RESPONSE, sourceType: cred.mainType, credentialContext: {}
    },
  }
}

const expandType = (
  schema: ExtensionSchema, cred: CustomDescription<DefaultSubject> | CredentialDescription
): CredentialDescription<DefaultSubject> => {
  return {
    claimType: castClaimType(cred),
    offerType: castOfferType(cred),
    ...(schema.credentials && schema.credentials[cred.mainType] || {}),
    ...cred,
    credentialContext: {
      ...cred.credentialContext,
      ...(isCustom(cred) ? Object.fromEntries(
        Object.entries(cred.subjectMeta as SubjectMeta<DefaultSubject>)
          .filter(([, field]) => field.term).map(
            ([key, field]) => [key, field.term]
          )
      ) as MultiSchema : {})
    },
  }
}