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

import { DIDCommHelper, WSClientConfig } from "@owlmeans/regov-comm"
import { Extension } from "@owlmeans/regov-ssi-core"


export const REGOV_EXT_COMM_NAMESPACE = 'owlmeans-regov-ext-comm'

export type CommExtConfig = {
  wsConfig: { [alias: string]: WSClientConfig }
}

export type CommExtension = Extension & {
  didComm?: { [alias: string]: DIDCommHelper }
}

export const DEFAULT_SERVER_ALIAS = 'default'

export const BASIC_IDENTITY_TYPE = 'Identity'