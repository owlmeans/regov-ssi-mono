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

import { buildExtensionSchema, ExtensionDetails } from "../../schema"
import {  buildExtension } from "../../ext"
import { REGISTRY_TYPE_CREDENTIALS } from "../../../wallet"


export const buildUniversalExtension = (details: ExtensionDetails) =>
  buildExtension(buildExtensionSchema(
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
