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

import { createContext, PropsWithChildren, ReactNode } from "react"
import { TFunction } from "i18next"

export type EntityParams<Subject extends {}> = {
  t: TFunction
  entity: string
  subject: Subject
  title?: string | ReactNode
}

export type EntityProps<Subject extends {}> = PropsWithChildren<EntityParams<Subject>>

export type EntityItemProps<Subject extends {}, Params extends {}> =
  PropsWithChildren<Partial<EntityParams<Subject>> & Params>

export type EntityContextParams<Subject extends {}> = {
  subject?: Subject
  t?: TFunction
  entity: string
}

export const EntityContext = createContext<EntityContextParams<{ [key: string]: any }>>({ entity: 'credential' })

export const EntityContextConsumer = EntityContext.Consumer