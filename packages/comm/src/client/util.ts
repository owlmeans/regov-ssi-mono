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
  CredentialWrapper, Credential, ExtensionRegistry, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, RegistryItem,
  WalletWrapper, Presentation
} from "@owlmeans/regov-ssi-core"
import { IncommigDocumentWithConn, IncommingWrapperMeta } from "../types"


export const triggerIncommingDocView = async <
  Subject extends {} = {},
  Type extends RegistryItem<Subject> = Presentation<Credential<Subject>>,
  Meta extends IncommingWrapperMeta = IncommingWrapperMeta
>(
  registry: ExtensionRegistry, wallet: WalletWrapper, wrapper: CredentialWrapper<Subject, Type, Meta>
) => {
  await registry.triggerEvent<IncommigDocumentWithConn>(
    wallet, EXTENSION_TRIGGER_INCOMMING_DOC_RECEIVED, {
    credential: wrapper.credential as unknown as Presentation, statusHandler: { successful: false },
    conn: (wrapper.meta as IncommingWrapperMeta).conn,
    cleanUp: () => undefined
  })
}