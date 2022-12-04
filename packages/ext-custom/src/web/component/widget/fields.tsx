import { MainTextInput, PrimaryFormProps } from "@owlmeans/regov-lib-react"
import React, { Fragment, FunctionComponent } from "react"

import { CustomDescription, UseFieldAt } from "../../../custom.types"
import { castSectionKey } from "../../utils/tools"


export const FieldsRenderer: FunctionComponent<FieldsRendererProps> = ({ purpose, descr, props }) =>
  <Fragment>
    {Object.entries(descr.subjectMeta).filter(
      ([, field]) => field.useAt.includes(purpose)
    ).map(
      ([key]) => <MainTextInput key={key} {...props}
        field={`${castSectionKey(descr)}.${purpose}.${key}`} />
    )}
  </Fragment>

export type FieldsRendererProps = {
  purpose: UseFieldAt
  descr: CustomDescription<Record<string, any>>
  props: PrimaryFormProps
}