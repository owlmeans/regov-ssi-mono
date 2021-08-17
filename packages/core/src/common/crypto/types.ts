import { CommonKey } from "common/types/key";

export type CryptoHelper = {
  buildSignSuite: (keyOptions: BuildSignSignatureOptions) => Object

  hash: (data: string) => string

  sign: (data: string, key: string) => string

  getRandomBytes: (size: number) => Promise<Uint8Array>

  verify: (signature: string, data: string, key: string) => boolean

  normalizePassword: (password: string) => Uint8Array

  encrypt: (body: string, password: string) => Promise<string>

  decrypt: (chiper: string, password: string)=> Promise<string>

  makeDerivationPath: (index?: number, change?: number, account?: number, bc?: string) => string

  makeId: (key: string, payload?: string, expand?: boolean) => string

  /**
   * @bug seed param implicitly requires Buffer not Uint8Array!
   */
  getKey: (seed: Uint8Array, derivationPath?: string) => CommonKey & { dp: string }
}

export type BuildSignSignatureOptions = {
  publicKey: string
  privateKey: string
  id: string
  controller: string
}