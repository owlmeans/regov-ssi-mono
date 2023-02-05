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
  CredentialDescription, CredentialSchema, MaybeArray, Presentation, Credential, UnsignedCredential
} from "@owlmeans/regov-ssi-core"
import { ExpandedTermDefinition } from "jsonld"


export type CustomDescription<
  Subject extends {} = {},
  Schema extends CredentialSchema = CredentialSchema,
> = CredentialDescription<Subject, Schema> & {
  subjectMeta: SubjectMeta<Subject>
  ns: string
  typeAlias?: string
  defaultLabel?: string
  expirationPeriod?: number
  customExtFlag: true
}

export const isCustom = <Subject extends {} = {}>(
  cred: CredentialDescription<Subject>
): cred is CustomDescription<Subject> => (cred as CustomDescription).customExtFlag

export type DefaultSubject = Record<string, any>

export type DefaultCredential = Credential<DefaultSubject>

export type DefaultUnsigned = UnsignedCredential<DefaultSubject>

export type DefaultPresentation = Presentation<DefaultCredential>

export type DefaultDescription = CustomDescription<DefaultSubject>

export type SubjectMeta<Subject extends {}> = {
  [k in keyof Subject]: SubjectFieldMeta
}

export type SubjectFieldMeta = {
  useAt: MaybeArray<UseFieldAt>
  defaultLabel?: string
  defaultHint?: string
  term?: ExpandedTermDefinition
  validation?: ValidationOptions
}

export type ValidationOptions = Partial<{
  required: boolean
  minLength: number
  maxLength: number
  pattern: RegExp
}>

export const USE_CREATE_CLAIM = "claim_create"
export const USE_PREVIEW_CLAIM = "claim_preview"
export const USE_ITEM_CLAIM = "claim_item"
export const USE_CLAIM_VIEW = "claim_view"
export const USE_CREATE_OFFER = "offer_create"
export const USE_ITEM_OFFER = "offer_item"
export const USE_VIEW_OFFER = "offer_view"
export const USE_ITEM_CRED = "cred_item"
export const USE_CRED_VIEW = "cred_view"

export const useFieldPurposes = [
  USE_CREATE_CLAIM, USE_PREVIEW_CLAIM, USE_ITEM_CLAIM, USE_CLAIM_VIEW,
  USE_CREATE_OFFER, USE_ITEM_OFFER, USE_VIEW_OFFER, USE_ITEM_CRED,
  USE_CRED_VIEW
]

export const enum UseFieldAt {
  CLAIM_CREATE = "claim_create",
  CLAIM_PREVIEW = "claim_preview",
  CLAIM_ITEM = "claim_item",
  CLAIM_VIEW = "claim_view",
  OFFER_CREATE = "offer_create",
  OFFER_ITEM = "offer_item",
  OFFER_VIEW = "offer_view",
  CRED_ITEM = "cred_item",
  CRED_VIEW = "cred_view"
}

export const DEFAULT_SUFFIX_CLAIM = "Claim"
export const DEFAULT_SUFFIX_OFFER = "Offer"
export const DEFAULT_SUFFIX_REQUEST = "Request"
export const DEFAULT_SUFFIX_RESPONSE = "Response"