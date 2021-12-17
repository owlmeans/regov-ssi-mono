
import i18n, { InitOptions } from 'i18next'

import { initReactI18next } from 'react-i18next'


export const i18nSetup = (options: InitOptions) => {
  i18n.use(initReactI18next)
    .init(options)

  return i18n
}