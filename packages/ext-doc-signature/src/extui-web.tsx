import { buildUIExtension, UIExtensionFactoryProduct } from "@owlmeans/regov-lib-react"
import { signatureExtension } from "./ext"

export const signatureWebExtension = buildUIExtension(signatureExtension, (
  purpose, type?
) => {
  console.log(purpose, type)
  return [] as UIExtensionFactoryProduct<{}>[]
})