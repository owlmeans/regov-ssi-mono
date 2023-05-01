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
  BASE_CREDENTIAL_TYPE, 
  BASE_PRESENTATION_TYPE 
} from "@owlmeans/regov-ssi-core"

export const LIBREACT_HOLDER_ISNT_UNSIGNEDID = 'LIBREACT_HOLDER_ISNT_UNSIGNEDID'

export type VerificationResult = PresentationVerificationResult | CredentialVerificationResult | UnknownVerificationResult

export type PresentationVerificationResult = BaseVerificationResult & {
  type: typeof BASE_PRESENTATION_TYPE
  purpose?: string
  credentials: CredentialVerificationResult[]
}

export type CredentialVerificationResult = BaseVerificationResult & {
  type: typeof BASE_CREDENTIAL_TYPE
  hasEvidence: boolean
  hasSchema: boolean
  selfSigned: boolean
}

export type UnknownVerificationResult = {
  type: 'unknown'
}

export type BaseVerificationResult = {
  valid: boolean
  extension?: string
}