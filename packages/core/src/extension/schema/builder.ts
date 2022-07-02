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

import { addToValue, MaybeArray, normalizeValue } from "../../common"
import { documentWarmer } from "../../did"
import { CredentialDescription, ExtensionDetails, ExtensionEvent, ExtensionSchema } from "./types"


export const buildExtensionSchema = <CredType extends string>(
  details: ExtensionDetails,
  credentials: { [key: string]: CredentialDescription },
): ExtensionSchema => {
  const _schema = {
    details,
    credentials: Object.entries<CredentialDescription>(credentials).reduce((creds, [key, cred]) => {
      // if (cred.contextUrl) {
      //   documentWarmer(
      //     cred.contextUrl,
      //     JSON.stringify({
      //       '@context': cred.credentialContext
      //     })
      //   )
      // }

      return {
        ...creds,
        [key]: {
          ...cred,
          ...(cred.claimType ? { claimType: cred.claimType } : { claimType: details.types?.claim })
        }
      }
    }, {} as { [key in CredType]: CredentialDescription }),
  }

  return _schema
}

export const addObserverToSchema = (
  schema: ExtensionSchema,
  event: MaybeArray<ExtensionEvent>
): ExtensionSchema => ({
  ...schema, events: normalizeValue(addToValue(schema.events, event))
})