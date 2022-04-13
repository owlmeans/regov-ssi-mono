import { DIDDocument, didPurposeList, DIDVerificationItem, normalizeValue } from "@owlmeans/regov-ssi-core"
import { JWTDecoded } from "did-jwt/lib/JWT"
import { Resolvable } from "did-resolver"


export const buildBasicResolver = (jwt: JWTDecoded): Resolvable => {
  return {
    resolve: async () => {
      const did: DIDDocument = JSON.parse(JSON.stringify(jwt.payload.sender))
      didPurposeList.forEach(
        purpose => {
          if (did[purpose]) {
            did[purpose] = normalizeValue(did[purpose]) as DIDVerificationItem[]
          }
        }
      )
      if (did.proof) {
        delete (did as any).proof
      }

      return {
        didResolutionMetadata: {},
        didDocumentMetadata: {},
        didDocument: did as any
      }
    }
  }
}