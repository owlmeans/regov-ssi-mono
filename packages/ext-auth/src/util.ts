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

import { Credential, Presentation } from "@owlmeans/regov-ssi-core";
import { 
  AuthSubject, REGOV_AUTH_REQUEST_TYPE, REGOV_AUTH_RESPONSE_TYPE, REGOV_CREDENTIAL_TYPE_AUTH 
} from "./types";


export const getAuthFromPresentation = (presentation: Presentation) => {
  if (!presentation.type.includes(REGOV_AUTH_RESPONSE_TYPE)
   && !presentation.type.includes(REGOV_AUTH_REQUEST_TYPE)) {
    return undefined
  }

  return presentation.verifiableCredential.find(
    credential => credential.type.includes(REGOV_CREDENTIAL_TYPE_AUTH)
  )
}

export const getAuthSubject = (cred: Credential): AuthSubject => {
  return cred.credentialSubject as unknown as AuthSubject
}

export const pinValidation = {
  required: true,
  minLength: 4,
  pattern: /^\d+$/
}