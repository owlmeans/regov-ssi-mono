import React from 'react'
import { I18nextProvider } from 'react-i18next'
import { i18nDefaultOptions, i18nSetup } from '@owlmeans/regov-lib-react'


const i18n = i18nSetup(i18nDefaultOptions)

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export const decorators = [
  Story => <I18nextProvider i18n={i18n}><Story /></I18nextProvider>
]