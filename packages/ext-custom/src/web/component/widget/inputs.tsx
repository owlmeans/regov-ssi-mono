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

import { MainTextInput, PrimaryFormProps } from "@owlmeans/regov-lib-react"
import React, { Fragment, FunctionComponent } from "react"

import { CustomDescription, UseFieldAt } from "../../../custom.types"
import { castFieldType, isTermPictures } from "../../../picture.types"
import { castSectionKey } from "../../utils/tools"
import { PicsturesField } from "./field/pictures"


export const InputsRenderer: FunctionComponent<InputsRendererProps> = ({ purpose, descr, props }) =>
  <Fragment>
    {Object.entries(descr.subjectMeta).filter(
      ([, field]) => field.useAt.includes(purpose)
    ).map(
      ([key, field]) => {
        if (isTermPictures(field)) {
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