import { CommonType, CredentialSubjectType, CredentialWrapper, Identity, IdentitySubect, WalletWrapper } from "metabelarusid-core"

export type PropsWithWallet = { wallet: WalletWrapper }

export type IdentityPassportWrapper = CredentialWrapper<IdentityPassportSubject, IdentityPassport>

export type IdentityPassport = Identity<IdentityPassportSubject>

export type IdentityPassportSubject = IdentitySubect<IdentityPassportSubjectType>

export type IdentityPassportSubjectType = CredentialSubjectType & { info: string }


export const DID_PREFIX = process.env.DID_PREFIX || 'metatest'

export const WALLET_TYPE_PREFIX = DID_PREFIX[0].toUpperCase() + DID_PREFIX.substr(1)

export const TYPE_PASSPORT_SUBJECT = `${WALLET_TYPE_PREFIX}PassportIdentity`

export const BASE_CREDENTIAL_TYPE = 'VerifiableCredential'

export const BASE_CREDENTIAL_SCHEMA = process.env.DID_SCHEMA || 'https://www.w3.org/2018/credentials/v1'

export const PASSPORT_CREDENTIAL_TYPES: CommonType = [BASE_CREDENTIAL_TYPE, TYPE_PASSPORT_SUBJECT]