
import { _keyChainHelper } from "common/helper/key";
import { CommonContext } from "common/types";
import { CreateCredentialMethod, ERROR_NO_HOLDER, ERROR_NO_ISSUER, SignCredentialMethod } from "./types";


export const buildCreateCrednetialMethod =
  (context: CommonContext): CreateCredentialMethod =>
    async (type, subject, holder = undefined) => {
      if (holder === undefined) {
        throw new Error(ERROR_NO_HOLDER)
      }

      return context.buildCredential({
        id: 'did:peer:xxxxx', // @TODO generate ID from context
        type,
        subject,
        holder
      })
    }

export const buildSignCredentialMethod =
  (context: CommonContext): SignCredentialMethod =>
    async (credential, issuer?, options = {}) => {
      if (!issuer) {
        throw new Error(ERROR_NO_ISSUER)
      }

      const key = _keyChainHelper.parseSigningKeyOptions(context, options)
      return context.signCredential(
        credential,
        issuer,
        await _keyChainHelper.keyToCommonKey(
          key,
          options.password || context.keyChain.getDefaultPassword(),
          { rotation: options.rotation }
        ),
        { controllerRole: options.controllerRole }
      )
    }