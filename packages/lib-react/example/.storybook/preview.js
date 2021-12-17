import {
  i18nDefaultOptions,
  i18nSetup,
  RegovProvider,
  basicNavigator,
  createWalletHandler
} from '@owlmeans/regov-lib-react'
import { webComponentMap } from '@owlmeans/regov-lib-react-web'


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
  Story => <RegovProvider
    map={webComponentMap}
    handler={createWalletHandler()}
    navigator={basicNavigator}
    config={{
      DID_PREFIX: 'ssitest'
    }}
    i18n={i18n}><Story /></RegovProvider>
]