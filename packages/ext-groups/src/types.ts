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

import { Extension } from "@owlmeans/regov-ssi-core"

export const REGOV_CREDENTIAL_TYPE_GROUP = 'OwlMeans:Regov:Group'

export const REGOV_CREDENTIAL_TYPE_MEMBERSHIP = 'OwlMeans:Regov:Group:Membership'

export const REGOV_CLAIM_TYPE = 'OwlMeans:Regov:Group:Claim'
export const REGOV_OFFER_TYPE = 'OwlMeans:Regov:Group:Offer'

export const BASIC_IDENTITY_TYPE = 'Identity'

export const REGOV_EXT_GROUP_NAMESPACE = 'owlmeans-regov-ext-groups'

export type RegovGroupCredential = typeof REGOV_CREDENTIAL_TYPE_GROUP
export type RegovGroupMembershipCredential = typeof REGOV_CREDENTIAL_TYPE_MEMBERSHIP
export type RegovGroupClaim = typeof REGOV_CLAIM_TYPE

export type RegovGroupExtensionTypes = RegovGroupCredential | RegovGroupMembershipCredential | RegovGroupClaim

export type GroupSubject = {
  uuid: string
  name: string
  description: string
  createdAt: string
}

export type RegovGroupExtension = Extension

export type MembershipSubject = {
  groupId: string
  role: string
  memberCode: string
  description: string
  createdAt: string
}