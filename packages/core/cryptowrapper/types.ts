
export type Crypto = {
  generateKeyChain: (keyChainClaim?: KeyChainClaim | KeyChain) => Promise<KeyChain>
  generateKey: (KeyChain: KeyChain, claim: KeyPairClaim) => Promise<KeyPair>
  addEntityKey: (keyChain: KeyChain, type?: string, bip?: string) => Promise<KeyChain>
  addKey: (KeyChain: KeyChain, alias: string, key?: KeyPair | KeyPairClaim) => Promise<KeyChain>
  perRotateEntityKey: (KeyChain: KeyChain, newKey?: KeyPair) => Promise<KeyChain>
  rotateEntityKey: (KeyChain: KeyChain, newKey?: KeyPair) => Promise<KeyChain>

  signWithKey: (key: KeyPair, data: string) => Promise<string>
  verifyWithKey: (key: KeyPair|string, signature: string, data: string) => Promise<boolean>

  encryptWithPassword: (password: string, data: string) => Promise<string>
  decryptWithPassword: (password: string, data: string) => Promise<string>

  produceAsymmetry: (senderKey: KeyPair, recipintKey: KeyPair|string, type?: string) => Promise<Assymetry>
  encryptAsymmetry: (assymetry: Assymetry, data: string) => Promise<string>
  decryptAsymmetry: (recipientKey: KeyPair, data: string) => Promise<[Assymetry, string]>
  rotateAsymmetry: (assymetry: Assymetry) => Promise<Assymetry>

  hash: (data: string, type?: string) => Promise<string>
}

export type CryptoContext = {
}

export type Assymetry = {
  senderKey: KeyPair
  recipientKey: KeyPair
  encryptionKey: KeyPair
  decryptionKey: KeyPair
  details: unknown
  type: string
}

export type KeyChain = {
  intialized: boolean,
  mnemonic?: string
  seed: string
  entityKey: EntityKey
  keys: {[k: string]: KeyPair}
  nextEntityKey: EncryptedKeyPair
}

export type KeyChainClaim = {
  mnemonic?: string
  seed?: string
  empty?: boolean
}

export type EntityKey = {
  bip: string
  address: string
  currentRotation: number
  rotations: EntityKeyRotation[]
  type: string
}

export type EntityKeyRotation = {
  keyPair: KeyPair,
  nextDigest: string,
  date: string
}

export type KeyPairClaim = {
  bip?: string
  type?: string
}

export type KeyPair = {
  bip: string
  type: string
  pk: string
  pubkey: string
}

export type EncryptedKeyPair = {
  encryption: string
} & KeyPair