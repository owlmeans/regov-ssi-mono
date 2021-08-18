import { CryptoKey, CryptoHelper } from 'metabelarusid-common'
import { DIDDocumnet } from "types"

export const buildCreateDIDMethod =
  (context: CryptoHelper) => (key: CryptoKey, data?: string): DIDDocumnet => {

    return {
      '@context': [
        'https://w3id.org/security/v2'
      ],
      id: ''
    }
  }