import { MaybeArray } from "@owlmeans/regov-ssi-common";
import { Extension } from "../ext";
import { ExtensionEvent } from "../schema";


export type ExtensionRegistry<
  Ext extends Extension<string, string | undefined> = Extension<string, string | undefined>
  > = {
    extensions: Ext[],
    registerAll: (exts: Ext[]) => Promise<void>
    getExtensions: (type: string) => Ext[]
    getExtension: (type: string, code?: string) => Ext
    register: (ext: Ext) => Promise<void>
    registerSync: (ext: Ext) => void
    getObservers: <FlowType extends string>(event: MaybeArray<string>) =>  [ExtensionEvent<FlowType>, Ext][]
  }


export const ERROR_NO_EXTENSION = 'ERROR_NO_EXTENSION'