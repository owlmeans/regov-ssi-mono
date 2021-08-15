
export type Credential<Subject extends CredentialSubject = CredentialSubject> = {

} & UnsignedCredentail<Subject>

export type CredentialSubject = {

}

export type UnsignedCredentail<Subject extends CredentialSubject = CredentialSubject> = {

}

export type CredentialTypeItem = 'VerifiableCrdential' | string

export type CrdentialType = CredentialTypeItem[]

/**
 * How to build id for document.
 * !!! Persnalized id will use 
 */
export type IdType =
  typeof IDTYPE_TRECABLE
  | typeof IDTYPE_DETACHED
  | typeof IDTYPE_PERSONALIZED


/**
 * Id consists of two parts, identity id and document id
 */
export const IDTYPE_PERSONALIZED = 'personalized'
/**
 * There is a way to check if id belongs to an identity
 */
export const IDTYPE_TRECABLE = 'traceable'
/**
 * It's immposible to trace person identity by id
 */
export const IDTYPE_DETACHED = 'detached'