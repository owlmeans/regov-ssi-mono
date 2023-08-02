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

import authRequest from './schemas/auth-request.json'
import auth from './schemas/auth.json'
import didSchema from './schemas/did-schema.json'
import docSignature from './schemas/doc-signature.json'
import docSignatureReq from './schemas/doc-signature-request.json'
import groupMembership from './schemas/group-membership.json'
import group from './schemas/group.json'
import identity from './schemas/identity.json'
import comm from './schemas/comm.json'
import commRequest from './schemas/comm-request.json'

import { documentWarmer } from '@owlmeans/regov-ssi-core'

documentWarmer('https://owlmeans.com/schemas/did-schema.json#', JSON.stringify(didSchema))
documentWarmer('https://owlmeans.com/schemas/did-schema.json', JSON.stringify(didSchema))
documentWarmer('https://owlmeans.com/schema/auth-request', JSON.stringify(authRequest))
documentWarmer('https://owlmeans.com/schema/auth', JSON.stringify(auth))
documentWarmer('https://owlmeans.com/schema/doc-signature', JSON.stringify(docSignature))
documentWarmer('https://owlmeans.com/schema/doc-signature-request', JSON.stringify(docSignatureReq))
documentWarmer('https://owlmeans.com/schema/group-membership', JSON.stringify(groupMembership))
documentWarmer('https://owlmeans.com/schema/group', JSON.stringify(group))
documentWarmer('https://owlmeans.com/schema/identity', JSON.stringify(identity))
documentWarmer('https://schema.owlmeans.com/comm-request.json', JSON.stringify(commRequest))
documentWarmer('https://schema.owlmeans.com/comm.json', JSON.stringify(comm))