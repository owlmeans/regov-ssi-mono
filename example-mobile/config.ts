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

export const config = {
  DID_PREFIX: process.env.REACT_APP_DID_PREFIX || 'exwaldid',
  DID_SCHEMA_PATH: process.env.REACT_APP_DID_SCHEMA_PATH || 'exdid-schema',
  code: process.env.REACT_APP_BUNDLE_CODE || 'excode',
  baseSchemaUrl: process.env.REACT_APP_SCHEMA_URL || undefined,
  name: process.env.REACT_APP_NAME || 'Noname app',
  development: true
}