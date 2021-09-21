import { WalletWrapper } from "@owlmeans/regov-ssi-core"
import { DIDDocument } from "@owlmeans/regov-ssi-did"

/**
 * @TODO Extract to a separate package (chain)
 */
export const didChainHelper = (wallet: WalletWrapper) => {
  return {
    delegate: (did: DIDDocument, delegatee: DIDDocument) => {
      /**
       * @PROCEED
       * @Case 1 
       * 
       * 1. We generate new did id, based on:
       *  1.1. source did,
       *  1.2. added methods
       * 2. We added alsoKnownAs property containing source did id
       * 3. We extend functionality of did look up by id to consider alsoKnownAs property
       */
    }
  }
}