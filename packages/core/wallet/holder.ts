import { SimpleThing, VCV1Type, VPV1 } from "@affinidi/vc-common"

import {
  HolderWalletOperator,
  CredentialsClaim,
  Identity,
  SubjectClaim,
  Wallet,
  WalletContext,
  PersentationRequest,
  CredentialsEntity,
  CREDENTIALS_TYPE_KEY_PERMISSION
} from "./types"

import { _produceGetSubjectsIdMethod } from './opertor'
import { _produceVerifyCredentialsMethod } from "./verifier"


export const produceWalletHolder =
  (wallet: Wallet, context: WalletContext): () => HolderWalletOperator =>
    () => ({
      createCredentialsClaim: _produceCreateCredentialsClaimMethod(wallet, context),
      createPresentation: _produceCreatePresentationMethod(wallet, context),
      addCredentails: _produceAddCredentialsMethod(wallet, context)
    })

const _produceCreateCredentialsClaimMethod =
  (wallet: Wallet, context: WalletContext) =>
    async <Data extends SimpleThing>(
      subjectClaims: SubjectClaim<Data>[],
      type: VCV1Type,
      issuer: Identity,
      holder?: Identity
    ): Promise<CredentialsClaim<Data>> => {
      const getSubjectsId = _produceGetSubjectsIdMethod(wallet, context)

      const id = await getSubjectsId(
        subjectClaims, type, holder || wallet.identity.identity
      )

      return {
        issuer,
        claim: {
          '@context': context.getDefaultCredentialsContext(),
          type,
          id,
          holder: holder || wallet.identity.identity,
          credentialSubject: subjectClaims
        }
      }
    }

const _produceCreatePresentationMethod =
  (wallet: Wallet, context: WalletContext) =>
    async (request: PersentationRequest, holder?: Identity): Promise<VPV1> =>
      context.producePresentation(wallet, request.requests.map(request => ({
        request,
        results: Object.entries(wallet.credentials.didIndex)
          .map(([, credentials]) => credentials)
          .filter(credentials => {
            if (request.issuer && !request.issuer.find(issuer => credentials.issuer === issuer.id)) {
              return false
            }

            if (request.type.find(type => !credentials.type.includes(type))) {
              return false
            }

            return true
          })
      })), holder)

const _produceAddCredentialsMethod =
  (wallet: Wallet, context: WalletContext) =>
    async (credentials: CredentialsEntity, alias?: string, claim?: CredentialsClaim): Promise<boolean> => {
      const id = credentials.id

      if (claim) {
        if (claim.issuer && (claim.issuer.id !== credentials.issuer)) {
          return false
        }
        if (claim.claim.holder.id !== credentials.holder.id) {
          return false
        }
        if (Array.isArray(claim.claim.credentialSubject)) {
          if (!claim.claim.credentialSubject.find(
            left => {
              if (Array.isArray(credentials.credentialSubject)) {
                return credentials.credentialSubject.find(
                  right => context.subjectCompare(left, right)
                )
              }
              return context.subjectCompare(left, credentials.credentialSubject)
            })) {
            return false
          }
        }
        if (claim.claim.type.find(type => !credentials.type.includes(type))) {
          return false
        }
      }

      const verifyCredentials = _produceVerifyCredentialsMethod(wallet, context)

      if (claim?.claim.holder) {
        if (!await verifyCredentials(credentials, claim?.claim.holder)) {
          return false
        }
      } else {
        if (!await verifyCredentials(credentials, wallet.identity.identity)) {
          return false
        }
      }

      alias = alias || `${credentials.issuer}-${credentials.type.join('_')}`
      wallet.credentials.didIndex[id] = credentials
      wallet.credentials.aliasIndex[alias] = [id]
      credentials.type.forEach(type => {
        if (!wallet.credentials.aliasIndex[type]) {
          wallet.credentials.aliasIndex[type] = []
        }
        wallet.credentials.aliasIndex[type].push(id)
      })
      if (credentials.type.includes(context.getCredentialsType(CREDENTIALS_TYPE_KEY_PERMISSION))) {
        wallet.credentials.permissions.push(id)
      } else {
        wallet.credentials.credentials.push(id)
      }

      return true
    }
