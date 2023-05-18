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

import { PrimaryFormProps, RegovValidationRules } from "@owlmeans/regov-lib-react"
import { UseFormReturn, useForm, DefaultValues, FieldValues } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { CustomDescription, UseFieldAt } from "../../../custom.types"
import { isTermPictures } from "../../../picture.types"
import { castSectionKey } from "../../utils/tools"


export const buildForm = (
  purpose: UseFieldAt, descr: CustomDescription,
  defaultHolder: string,
  createForm: typeof useForm,
  castTransaltion: typeof useTranslation,
  options?: BuildFormOptions
): [UseFormReturn, PrimaryFormProps] => {
  const sectionKey = castSectionKey(descr)
  const { t, i18n } = castTransaltion(descr.ns)

  return [
    createForm({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        [sectionKey]: {
          [purpose]: { ...produceDefaults(purpose, descr), ...options?.values },
          [options?.controllerField || 'holder']: defaultHolder,
          alert: ''
        }
      } as DefaultValues<FieldValues>
    }),
    {
      t, i18n, title: `${sectionKey}.form.${purpose}.title`,
      rules: produceValidation(purpose, descr)
    }
  ]
}

export type BuildFormOptions = {
  controllerField?: string
  values?: any
}

export const castHolderField = (descr: CustomDescription) =>
  `${castSectionKey(descr)}.holder`

export const castIssuerField = (descr: CustomDescription) =>
  `${castSectionKey(descr)}.issuer`

export const produceDefaults = (
  purpose: UseFieldAt, descr: CustomDescription<Record<string, any>>
): Record<string, any> => ({
  ...descr.defaultSubject,
  ...Object.fromEntries(Object.entries(descr.subjectMeta)
    .filter(([, field]) => field.useAt.includes(purpose))
    .map(([key, field]) => [key, isTermPictures(field) ? [] : '']))
})

export const produceValidation = (
  purpose: UseFieldAt, descr: CustomDescription<Record<string, any>>
): RegovValidationRules =>
  Object.fromEntries(Object.entries(descr.subjectMeta)
    .filter(([, field]) => field.useAt.includes(purpose) && field.validation)
    .map(([key, field]) => [
      `${castSectionKey(descr)}.${purpose}.${key}`, field.validation || {}
    ]))