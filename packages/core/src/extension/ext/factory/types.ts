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

import { CryptoKey } from "../../../common"
import { DIDDocumentUnsinged } from "../../../did"
import { UnsignedCredential } from "../../../vc"
import { EventParams } from "../../schema"


export const ERROR_FACTORY_EVIDENCE_HOLDER_FORMAT = 'ERROR_FACTORY_EVIDENCE_HOLDER_FORMAT'
export const ERROR_FACTORY_SIGNING_KEY_ISNT_RETRIVED = 'ERROR_FACTORY_SIGNING_KEY_ISNT_RETRIVED'
export const ERROR_CANT_IDENTIFY_CREDENTIAL = 'ERROR_CANT_IDENTIFY_CREDENTIAL'
export const ERROR_FACTORY_NO_IDENTITY = 'ERROR_FACTORY_NO_IDENTITY'

export const EVENT_EXTENSION_BEFORE_SIGNING_DID = 'ext:signing:did:before'

export type ExtensionEventBeforeSigningDid = EventParams & {
  unsigned: DIDDocumentUnsinged
  cred: UnsignedCredential
  key?: CryptoKey
}

export const EVENT_EXTENSION_AFTER_BULIDING_DID = 'ext:building:did:after'

export type ExtensionEventAfterBuildingDid = EventParams & {
  unsigned: DIDDocumentUnsinged
  cred: UnsignedCredential
  key?: CryptoKey
}