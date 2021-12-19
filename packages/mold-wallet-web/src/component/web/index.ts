
export * from './store'
export * from './main'

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
} from "./store"

export const webComponentMap: ImplementationMap = {
  'StoreCreation': StoreCreationWeb,
  'StoreLogin': StoreLoginWeb,
  'MainDashboard': MainDashboardWeb,
  'MainLoading': MailLoadingWeb,
  'MainMenu': MainMenuWeb,
}