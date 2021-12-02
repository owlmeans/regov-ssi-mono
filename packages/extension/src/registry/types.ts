import { Extension } from "../ext";


export type ExtensionRegistry<
  Ext extends Extension<string, string | undefined> = Extension<string, string | undefined>
  > = {
    extensions: Ext[],
    registerAll: (exts: Ext[]) => Promise<void>
    getExtensions: (type: string) => Ext[]
    getExtension: (type: string, code?: string) => Ext
    register: (ext: Ext) => Promise<void>
    registerSync: (ext: Ext) => void
  }


export const ERROR_NO_EXTENSION = 'ERROR_NO_EXTENSION'