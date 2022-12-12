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

import React, { FunctionComponent } from "react"
import { EntityRenderer, EntityTextRenderer } from "@owlmeans/regov-lib-react"
import { useTranslation } from "react-i18next"

import { CustomDescription, DefaultSubject, UseFieldAt } from "../../../custom.types"
import { castSectionKey } from "../../utils/tools"


export const FieldsRenderer: FunctionComponent<FieldsRendererProps> = ({ subject, descr, purpose }) => {
  const { t } = useTranslation(descr.ns)
  const sectionKey = castSectionKey(descr)

  return <EntityRenderer entity={`${sectionKey}.${purpose}`} subject={subject} t={t} >
    {
      Object.entries(descr.subjectMeta).filter(([, field]) => field.useAt.includes(purpose))
        .map(([key]) => {
          return <EntityTextRenderer key={key} field={key} showHint showLabel />
        })
    }
  </EntityRenderer>
}

export type FieldsRendererProps = {
  subject: DefaultSubject
  descr: CustomDescription<DefaultSubject>
  purpose: UseFieldAt
}