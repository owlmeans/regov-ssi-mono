import { MaybeArray } from "@owlmeans/regov-ssi-common";
import { Extension } from "../ext";
import { ExtensionEvent } from "../schema";


export type ExtensionRegistry = {
  extensions: Extension[],
  registerAll: (exts: Extension[]) => Promise<void>
  getExtensions: (type: string) => Extension[]
  getExtension: (type: string | string[], code?: string) => Extension
  register: (ext: Extension) => Promise<void>
  registerSync: (ext: Extension) => void
  getObservers: (event: MaybeArray<string>) => [ExtensionEvent, Extension][]
}


export const ERROR_NO_EXTENSION = 'ERROR_NO_EXTENSION'