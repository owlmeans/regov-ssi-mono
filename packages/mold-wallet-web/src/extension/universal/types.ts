import { UIExtension } from "@owlmeans/regov-lib-react"
import {
  Extension,
  UniversalCredentialT
} from "@owlmeans/regov-ssi-extension"


export type UniversalCredentailExtensionUI = UIExtension<UniversalCredentialT, Extension<UniversalCredentialT>>

export const UNIVERSAL_CREDENTAIL_I18N_NS = 'regov-ssi-ext-std-universal-credential'
export const UNIVERSAL_EXTENSION_SCREEN_PATH = '/ext/regov-universal'