import { VCV1 } from "@affinidi/vc-common";
import { Identity, VerifierWalletOperator, Wallet, WalletContext } from "./types";

export const produceWalletVerifier =
  (wallet: Wallet, context: WalletContext): () => VerifierWalletOperator =>
    () => ({
      verifyCredentials: _produceVerifyCredentialsMethod(wallet, context)
    })

export const _produceVerifyCredentialsMethod = 
(wallet: Wallet, context: WalletContext) =>
  async (credentials: VCV1, holder?: Identity): Promise<boolean> => {

    return true
  }