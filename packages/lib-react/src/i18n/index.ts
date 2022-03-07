/**
 *  Copyright 2022 OwlMeans
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


import { InitOptions } from 'i18next'

import enStore from './en/store.json'
import enCommon from './en/common.json'
import enMain from './en/main.json'
import enCredential from './en/credential.json'
import enFlow from './en/flow.json'

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
      'regov-wallet-flow': enFlow
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