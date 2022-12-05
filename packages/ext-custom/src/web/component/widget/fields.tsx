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