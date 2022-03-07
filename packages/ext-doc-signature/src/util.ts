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

import { MaybeArray, normalizeValue } from "@owlmeans/regov-ssi-core"
import { Presentation, Credential } from "@owlmeans/regov-ssi-core"
import {
  BASIC_IDENTITY_TYPE, REGOV_SIGNATURE_REQUEST_TYPE, REGOV_SIGNATURE_RESPONSE_TYPE,
  REGOV_CREDENTIAL_TYPE_SIGNATURE
} from "./types"


export const getSignatureRequestFromPresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(REGOV_SIGNATURE_REQUEST_TYPE)) {
    return undefined
  }

  return presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_SIGNATURE_REQUEST_TYPE)
  )
}

export const getSignatureResponseFromPresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(REGOV_SIGNATURE_RESPONSE_TYPE)) {
    return undefined
  }

  return presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_CREDENTIAL_TYPE_SIGNATURE)
  )
}

export const getSignatureRequestOwner = (crednetial: Credential) => {
  if (!crednetial.type.includes(REGOV_SIGNATURE_REQUEST_TYPE)) {
    return undefined
  }

  return normalizeValue<Credential>(crednetial.evidence as MaybeArray<Credential>).find(
    evidence => evidence?.type.includes(BASIC_IDENTITY_TYPE)
  )
}