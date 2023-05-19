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


import I18n, { InitOptions } from 'i18next'
import detector from 'i18next-browser-languagedetector'

import { initReactI18next } from 'react-i18next'

export const i18nSetup = (options: InitOptions) => {
  const i18n = I18n.createInstance(options)
  i18n.use(detector)
    .use(initReactI18next)
    .init()

  return i18n
}