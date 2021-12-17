
import { InitOptions } from 'i18next'

import enStore from './en/store.json'
import enCommon from './en/common.json'
import enMain from './en/main.json'
import enCredential from './en/credential.json'

export * from './setup'


export const i18nDefaultOptions: InitOptions = {
  lng: 'en',
  fallbackLng: 'en',
  debug: true,
  resources: {
    en: {
      'regov-wallet-store': enStore,
      'regov-wallet-common': enCommon,
      'regov-wallet-main': enMain,
      'regov-wallet-credential': enCredential,
    }
  },
  ns: [
    'regov-wallet-common', 'regov-wallet-main', 
    'regov-wallet-store', 'regov-wallet-credential'
  ],
  fallbackNS: 'regov-wallet-common',
  defaultNS: 'regov-wallet-common',
  interpolation: {
    escapeValue: false
  }
}