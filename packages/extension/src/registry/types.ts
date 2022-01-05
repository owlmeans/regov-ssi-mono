import { MaybeArray } from "@owlmeans/regov-ssi-common";
import { Extension } from "../ext";
import { ExtensionEvent } from "../schema";


export type ExtensionRegistry<
  CredType extends string,
  Ext extends Extension<CredType> = Extension<CredType>
  > = {
    extensions: Ext[],
    registerAll: (exts: Ext[]) => Promise<void>
    getExtensions: (type: string) => Ext[]
    getExtension: (type: string, code?: string) => Ext
    register: (ext: Ext) => Promise<void>
    registerSync: (ext: Ext) => void
    getObservers: (event: MaybeArray<string>) => [ExtensionEvent<CredType>, Ext][]
  }


export const ERROR_NO_EXTENSION = 'ERROR_NO_EXTENSION'