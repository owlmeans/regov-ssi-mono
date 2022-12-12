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

import { Presentation, Credential, normalizeValue, MaybeArray, isPresentation } from "@owlmeans/regov-ssi-core"
import { CustomDescription } from "../../custom.types"


export const getCredential = (
  descr: CustomDescription, presentation: Presentation
): Credential | undefined =>
  normalizeValue(presentation.verifiableCredential).find(cred => cred.type.includes(descr.mainType))

export const getSubject = <Subject extends MaybeArray<{}> = MaybeArray<{}>>(
  descr: CustomDescription, cred: Credential | Presentation
): Subject =>
  isPresentation(cred)
    ? (
      cred && getCredential(descr, cred)
        ? getSubject(descr, getCredential(descr, cred) as Credential)
        : undefined
    ) as Subject
    : cred.credentialSubject as Subject