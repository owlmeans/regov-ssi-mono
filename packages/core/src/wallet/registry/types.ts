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

import { MaybeArray } from "../../common"
import { Credential, Presentation, UnsignedCredential, } from "../../vc/types"


export type CredentialsRegistry<
  Subject extends {} = {},
  Type extends RegistryItem<Subject> = Credential<Subject>
  > = {
    rootCredential?: string
    defaultSection: string
    credentials: { [section: string]: CredentialWrapper<Subject, Type>[] }
  }

export type RegistryWrapperBuilder = (registry: CredentialsRegistry) => CredentialsRegistryWrapper

export type RegistryWrapperMethodBuilder<Method extends Function> = (registry: CredentialsRegistry) => Method

export type CredentialsRegistryWrapper = {
  registry: CredentialsRegistry
  addCredential: AddCredentialMethod
  lookupCredentials: LookupCredentialsMethod
  removeCredential: RemoveCredentialMethod
  removePeer: RemoveCredentialMethod
  getCredential: GetCredentialMethod
}

export type RemoveCredentialMethod =
  (
    credential: RegistryItem | CredentialWrapper,
    section?: string
  ) => Promise<CredentialWrapper>

export type AddCredentialMethod = <
  Subject extends MaybeArray<{}> = {},
  Type extends RegistryItem<Subject> = Credential<Subject>,
  Meta extends CredentialWrapperMetadata = CredentialWrapperMetadata
  >(
  credential: Type,
  section?: string
) => Promise<CredentialWrapper<Subject, Type, Meta>>

export type RegistryItem<
  Subject extends {} = {},
  PresentationT extends Presentation<UnsignedCredential<Subject>> = Presentation<UnsignedCredential<Subject>>
  > =
  Credential<Subject> | UnsignedCredential<Subject> | PresentationT

export type LookupCredentialsMethod = <
  Subject extends {} = {},
  Type extends RegistryItem<Subject> = Credential<Subject>
  >(
  type: string | string[],
  section?: string
) => Promise<CredentialWrapper<Subject, Type>[]>

export type GetCredentialMethod = <
  Subject extends {} = {},
  Type extends RegistryItem<Subject> = Credential<Subject>
  >(
  id?: string,
  section?: string
) => CredentialWrapper<Subject, Type> | undefined

export type RegistryType = typeof REGISTRY_TYPE_IDENTITIES
  | typeof REGISTRY_TYPE_CREDENTIALS
  | typeof REGISTRY_TYPE_UNSIGNEDS
  | typeof REGISTRY_TYPE_CLAIMS
  | typeof REGISTRY_TYPE_REQUESTS
  | string

export const REGISTRY_TYPE_IDENTITIES = 'identities'
export const REGISTRY_TYPE_CREDENTIALS = 'credentials'
export const REGISTRY_TYPE_UNSIGNEDS = 'unsigneds'
export const REGISTRY_TYPE_CLAIMS = 'claims'
export const REGISTRY_TYPE_REQUESTS = 'requests'

export const REGISTRY_SECTION_OWN = 'own'
export const REGISTRY_SECTION_PEER = 'peer'

export type CredentialWrapper<
  Subject extends {} = {},
  Type extends RegistryItem<Subject> = Credential<Subject>,
  Meta extends CredentialWrapperMetadata = CredentialWrapperMetadata
  > = {
    credential: Type
    meta: Meta
  }

export type CredentialWrapperMetadata = {
  secure: boolean
  title?: string
}