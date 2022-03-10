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


export * from './common'
export * from './credential'
export * from './main'

import { ImplementationMap } from '../../common'
import { MainLoadingWeb, MainMenuWeb, MainDashboardWeb, MainModalWeb, MainAuthAreaWeb, MainFooterWeb } from './main'
import { StoreCreationWeb, StoreLoginWeb, StoreListWeb } from "./store"
import { CredentialEvidenceWidgetWeb, CredentialListWeb, CredentialProcessorWeb } from './credential'


export const webComponentMap: ImplementationMap = {
  'StoreCreation': StoreCreationWeb,
  'StoreLogin': StoreLoginWeb,
  'MainDashboard': MainDashboardWeb,
  'MainLoading': MainLoadingWeb,
  'MainMenu': MainMenuWeb,
  'MainFooter': MainFooterWeb,
  'StoreList': StoreListWeb,
  'CredentialList': CredentialListWeb,
  'MainModal': MainModalWeb,
  'CredentialProcessor': CredentialProcessorWeb,
  'MainAuthArea': MainAuthAreaWeb,
  'CredentialEvidenceWidget': CredentialEvidenceWidgetWeb,
}