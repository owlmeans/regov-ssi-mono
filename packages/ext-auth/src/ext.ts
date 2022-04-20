import { buildExtension, buildExtensionSchema } from "@owlmeans/regov-ssi-core"
import { en } from "./i18n"
import { REGOV_EXT_ATUH_NAMESPACE } from "./types"


let authExtensionSchema = buildExtensionSchema({
  name: 'extension.details.name',
  code: 'owlmeans-regov-auth',
}, {})

export const authExtension = buildExtension(authExtensionSchema)

authExtension.localization = {
  ns: REGOV_EXT_ATUH_NAMESPACE,
  translations: { en }
}