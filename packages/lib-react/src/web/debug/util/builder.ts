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

import { Config } from "../../../common"
import { webCryptoHelper } from "@owlmeans/regov-ssi-core"
import { buildWalletWrapper } from "@owlmeans/regov-ssi-core"


export const buildDevWallet = async (config: Config, alias = DEFAULT_DEVELOPMENT_VOICE_ALIAS) =>
  await buildWalletWrapper(
    webCryptoHelper, '11111111', { alias, name: 'Development wallet' }, { 
      prefix: config.DID_PREFIX,
      defaultSchema: config.baseSchemaUrl,
      didSchemaPath: config.DID_SCHEMA_PATH,
    }
  )

export const DEFAULT_DEVELOPMENT_VOICE_ALIAS = 'development'