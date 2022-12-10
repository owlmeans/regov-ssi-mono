import { MainTextInput, PrimaryFormProps } from "@owlmeans/regov-lib-react"
import React, { Fragment, FunctionComponent } from "react"

import { CustomDescription, UseFieldAt } from "../../../custom.types"
import { castFieldType } from "../../../picture.types"
import { castSectionKey } from "../../utils/tools"
import { PicsturesField } from "./field/pictures"


export const InputsRenderer: FunctionComponent<InputsRendererProps> = ({ purpose, descr, props }) =>
  <Fragment>
    {Object.entries(descr.subjectMeta).filter(
      ([, field]) => field.useAt.includes(purpose)
    ).map(
      ([key, field]) => {
        if (field.term && field.term['@context'] && field.term['@context']['files']) {
          return <PicsturesField {...props} key={key} fieldType={castFieldType(key)}
            field={`${castSectionKey(descr)}.${purpose}.${key}`} />
        }

        return <MainTextInput key={key} {...props} field={`${castSectionKey(descr)}.${purpose}.${key}`} />
      }
    )}
  </Fragment>

export type InputsRendererProps = {
  purpose: UseFieldAt
  descr: CustomDescription<Record<string, any>>
  props: PrimaryFormProps
}