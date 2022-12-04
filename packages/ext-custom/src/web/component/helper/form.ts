import { PrimaryFormProps, RegovValidationRules } from "@owlmeans/regov-lib-react"
import { UseFormReturn, useForm, DefaultValues, FieldValues } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { CustomDescription, UseFieldAt } from "../../../custom.types"
import { castSectionKey } from "../../utils/tools"


export const buildForm = (
  purpose: UseFieldAt, descr: CustomDescription, defaultHolder: string,
  createForm: typeof useForm,
  castTransaltion: typeof useTranslation
): [UseFormReturn, PrimaryFormProps] => {
  const sectionKey = castSectionKey(descr)
  const { t, i18n } = castTransaltion(descr.ns)

  return [
    createForm({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        [sectionKey]: {
          [purpose]: produceDefaults(purpose, descr),
          hodler: defaultHolder,
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

export const castHolderField = (descr: CustomDescription) =>
  `${castSectionKey(descr)}.holder`

const produceDefaults = (
  purpose: UseFieldAt, descr: CustomDescription<Record<string, any>>
): Record<string, any> =>
  Object.fromEntries(Object.entries(descr.subjectMeta)
    .filter(([, field]) => field.useAt.includes(purpose))
    .map(([key]) => [key, '']))

const produceValidation = (
  purpose: UseFieldAt, descr: CustomDescription<Record<string, any>>
): RegovValidationRules =>
  Object.fromEntries(Object.entries(descr.subjectMeta)
    .filter(([, field]) => field.useAt.includes(purpose) && field.validation)
    .map(([key, field]) => [
      `${castSectionKey(descr)}.${purpose}.${key}`, field.validation || {}
    ]))