
import { LDKeyPair } from 'crypto-ld'
const { JwsLinkedDataSignature } = require('@digitalbazaar/jws-linked-data-signature')

export class Secp256k1Key extends LDKeyPair {
  constructor(options = {}) {
    super(options)
  }
}

export class Secp256k1Signature extends JwsLinkedDataSignature {
  constructor(options: Secp256k1SignatureOptions) {
    super({
      ...options, type: 'EcdsaSecp256k1Signature2019', alg: 'ES256K', LDKeyClass: Secp256k1Key,
    })

    this.requiredKeyType = 'EcdsaSecp256k1VerificationKey2019'
  }
}

export interface Secp256k1SignatureOptions {
  key?: {
    id: string
    signer: any
    verifier: any
  }
  singer?: any
  verifier?: any
  proof?: any
  date?: Date | string
  useNativeCanonize?: boolean
  canonizeOptions?: boolean
}
