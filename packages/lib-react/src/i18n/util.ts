import { UIExtensionRegistry } from "../extension"
import { i18n } from 'i18next'

export const i18nRegisterExtensions = (i18n: i18n, extensions: UIExtensionRegistry) => {
  extensions?.uiExtensions.forEach(ext => {
    if (ext.extension.localization) {
      Object.entries(ext.extension.localization.translations).forEach(([lng, resource]) => {
        if (ext.extension.localization?.ns) {
          i18n.addResourceBundle(lng, ext.extension.localization?.ns, resource, true, true)
        }
      })
    }
  })
}