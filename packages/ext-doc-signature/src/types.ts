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


export const REGOV_CREDENTIAL_TYPE_SIGNATURE = 'OwlMeans:Regov:Signature'

export const REGOV_CLAIM_TYPE_SIGNATURE = 'OwlMeans:Regov:Signature:Claim'
export const REGOV_OFFER_TYPE_SIGNATURE = 'OwlMeans:Regov:Signature:Offer'

export const REGOV_SIGNATURE_REQUEST_TYPE = 'OwlMeans:Regov:Signature:Request'
export const REGOV_SIGNATURE_RESPONSE_TYPE = 'OwlMeans:Regov:Signature:Response'

export const BASIC_IDENTITY_TYPE = 'Identity'

export const REGOV_EXT_SIGNATURE_NAMESPACE = 'owlmeans-regov-ext-doc-signature'

export type RegovSignatureCredential = typeof REGOV_CREDENTIAL_TYPE_SIGNATURE

export type SignatureSubject = {
  name: string
  description?: string
  documentHash: string
  docType: string
  filename?: string
  url?: string
  creationDate: string
  version?: string
  author: string
  authorId?: string
  signedAt?: string
}

export type SignatureRequestSubject = {
  description?: string
  documentHash?: string
  url?: string
  authorId?: string
  version?: string
}

export const DOCUMENT_TYPE_JSON = 'JSON'
export const DOCUMENT_TYPE_TEXT = 'Text'
export const DOCUMENT_TYPE_BINARY = 'Binary'

export const ERROR_WIDGET_AUTHENTICATION = 'ERROR_WIDGET_AUTHENTICATION'
export const ERROR_WIDGET_EXTENSION = 'ERROR_WIDGET_EXTENSION'
