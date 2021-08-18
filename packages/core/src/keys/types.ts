import { CryptoHelper } from "metabelarusid-common"

export type KeyChain = {
  defaultKey: string
  keys: { [key: string]: KeyPair }
}

export type KeyChainWrapper = {
  keys: KeyChain,

  getDefaultPassword: () => string

  openKey: (keypair: KeyPair, password: string, rotation?: number) => Promise<KeyRotation>

  createKey: (alias: string, password: string, options?: CreateKeyOptions) => Promise<KeyPair>
}

export type BuildKeyChainWrapperMethod =
  (options: {
    crypto: CryptoHelper,
    password: string,
    source?: string,
    keyOptions?: CreateKeyOptions
  }) => Promise<KeyChainWrapper>

export type KeyPair = {
  alias: string
  currentRotation: number
  rotations: KeyRotation[]
  type: string
  safe: boolean
  dp: DPArgs
  id: string
  seed: string
  safeComment?: string
}

export type KeyRotation = {
  seed?: string,
  private: string
  public: string
  opened: boolean
  type: string
  nextDigest?: string
  digest: string
  safe: boolean
  dp: DPArgs
  safeComment?: string
  future: boolean
}

export type CreateKeyOptions = {
  seed?: string
  opened?: boolean
  safe?: boolean
  safeComment?: string
  dp?: DPArgs
}

export type DPArgs = [number?, number?, number?, string?]