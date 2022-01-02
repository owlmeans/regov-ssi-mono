
export * from './common'

import {
  ImplementationMap
} from '@owlmeans/regov-lib-react'
import {
  MailLoadingWeb,
  MainMenuWeb,
  MainDashboardWeb,
} from './main'
import {
  StoreCreationWeb,
  StoreLoginWeb,
  StoreListWeb
} from "./store"
import {
  CredentialListWeb
} from './credential'


export const webComponentMap: ImplementationMap = {
  'StoreCreation': StoreCreationWeb,
  'StoreLogin': StoreLoginWeb,
  'MainDashboard': MainDashboardWeb,
  'MainLoading': MailLoadingWeb,
  'MainMenu': MainMenuWeb,
  'StoreList': StoreListWeb,
  'CredentialList': CredentialListWeb
}