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


import { InitOptions } from 'i18next'

import enStore from './en/store.json'
import enCommon from './en/common.json'
import enMain from './en/main.json'
import enCredential from './en/credential.json'

import ruStore from './ru/store.json'
import ruCommon from './ru/common.json'
import ruMain from './ru/main.json'
import ruCredential from './ru/credential.json'

import byStore from './by/store.json'
import byCommon from './by/common.json'
import byMain from './by/main.json'
import byCredential from './by/credential.json'

export * from './setup'


export const i18nDefaultOptions: InitOptions = {
  fallbackLng: 'en',
  debug: false,
  resources: {
    en: {
      'regov-wallet-store': enStore,
      'regov-wallet-common': enCommon,
      'regov-wallet-main': enMain,
      'regov-wallet-credential': enCredential,
    },
    ru: {
      'regov-wallet-store': ruStore,
      'regov-wallet-common': ruCommon,
      'regov-wallet-main': ruMain,
      'regov-wallet-credential': ruCredential,
    },
    be: {
      'regov-wallet-store': byStore,
      'regov-wallet-common': byCommon,
      'regov-wallet-main': byMain,
      'regov-wallet-credential': byCredential,
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