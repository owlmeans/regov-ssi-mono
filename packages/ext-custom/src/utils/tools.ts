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

import { CredentialDescription } from "@owlmeans/regov-ssi-core"
import { CustomDescription, DEFAULT_SUFFIX_CLAIM, DEFAULT_SUFFIX_OFFER, DEFAULT_SUFFIX_REFUSE, DEFAULT_SUFFIX_REQUEST, DEFAULT_SUFFIX_RESPONSE } from "../custom.types"


export const castClaimType = <Subject extends {} = {}>(
  cred: CustomDescription<Subject> | CredentialDescription<Subject>
) => cred.claimType ?? `${cred.mainType}${DEFAULT_SUFFIX_CLAIM}`

export const castOfferType = <Subject extends {} = {}>(
  cred: CustomDescription<Subject> | CredentialDescription<Subject>
) => cred.offerType ?? `${cred.mainType}${DEFAULT_SUFFIX_OFFER}`

export const castRequestType = <Subject extends {} = {}>(
  cred: CustomDescription<Subject> | CredentialDescription<Subject>
) => cred.requestType ?? `${cred.mainType}${DEFAULT_SUFFIX_REQUEST}`

export const castResponseType = <Subject extends {} = {}>(
  cred: CustomDescription<Subject> | CredentialDescription<Subject>
) => cred.responseType ?? `${cred.mainType}${DEFAULT_SUFFIX_RESPONSE}`

export const castRefuseType = <Subject extends {} = {}>(
  cred: CustomDescription<Subject> | CredentialDescription<Subject>
) => cred.refuseType ?? `${cred.mainType}${DEFAULT_SUFFIX_REFUSE}`
