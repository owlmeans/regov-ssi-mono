import { IssuerWalletOperator, Wallet, WalletContext } from "./types";

export const produceWalletIssuer =
(wallet: Wallet, context: WalletContext): () => IssuerWalletOperator =>
  () => ({
  })