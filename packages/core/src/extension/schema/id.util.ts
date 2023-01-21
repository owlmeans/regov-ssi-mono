import { CryptoKey, MaybeArray, normalizeValue, simplifyValue, singleValue } from "../../common"
import { DIDDocument, DIDDocumentPurpose, DIDDocumentUnsinged, DIDHelper, didPurposeList, DIDVerificationItem, VERIFICATION_KEY_CONTROLLER, VERIFICATION_KEY_HOLDER } from "../../did/types"
import { UnsignedCredential, Credential, isCredential } from "../../vc"
import { CredentialDescription } from "./types"


export const createVerifiableIdFromCredential = <Subject extends {}>(
  helper: DIDHelper,
  schema: CredentialDescription,
  key: CryptoKey,
  cred: UnsignedCredential<Subject> | Credential<Subject>
) => createVerifiableIdFromSubject(helper, schema, key, cred.credentialSubject)

export const createVerifiableIdFromSubject = <Subject extends {}>(
  helper: DIDHelper, schema: CredentialDescription, key: CryptoKey, subject: Subject
) => {
  const altKey = cleanUpKey(key)
  if (!schema.verfiableId) {
    return helper.makeDIDId(altKey, { data: JSON.stringify(subject), hash: true })
  }

  const meta = extractIdFieldsFromSubject(schema, subject)
  return createVerifiableId(helper, altKey, meta)
}

export const cleanUpKey = (key: CryptoKey) =>
  Object.fromEntries(Object.entries(key).filter(([key]) => key !== 'fragment'))

export const createVerifiableId = <Fields extends {}>(
  helper: DIDHelper, key: CryptoKey, meta: Fields
) => helper.makeDIDId(cleanUpKey(key), { data: JSON.stringify(meta), hash: true })

export const validateVerifiableId = async (
  helper: DIDHelper, schema: CredentialDescription, cred: UnsignedCredential | Credential
) => {
  if (!schema.verfiableId) {
    return true
  }

  const meta = extractIdFieldsFromCredential(schema, cred)
  let did: DIDDocument | undefined = helper.isDIDDocument(cred.holder) ? cred.holder : undefined
  if (isCredential(cred)) {
    if (helper.isDIDDocument(cred.issuer)) {
      did = cred.issuer
    }
  }

  if (!did) {
    console.log('no did')
    return false
  }

  let key = await helper.extractKey(did, VERIFICATION_KEY_CONTROLLER)
  if (!key) {
    key = await helper.extractKey(did, VERIFICATION_KEY_HOLDER)
  }
  if (!key) {
    console.log('no key')
    return false
  }

  const idInfo = helper.parseDIDId(cred.id)

  const id = helper.makeDIDId(cleanUpKey(key), { 
    data: JSON.stringify(meta), hash: true, prefix: idInfo.method
  })

  return id === cred.id
}

export const verifySubjectForIdIntegrity = <Subject extends {}>(
  schema: CredentialDescription, subject: Subject
) => {
  if (!schema.verfiableId) {
    return true
  }

  return !schema.verfiableId.fields.some(field => !(subject as Record<string, any>)[field])
}

export const verifyCredentialForIdItengrity = <Subject extends {}>(
  schema: CredentialDescription, cred: UnsignedCredential<Subject>
) => verifySubjectForIdIntegrity(schema, <Subject>singleValue(cred.credentialSubject))

export const extractIdFieldsFromSubject = <Subject extends {}>(
  schema: CredentialDescription, subject: Subject
): Partial<Subject> => {
  if (!schema.verfiableId) {
    return subject
  }

  return schema.verfiableId.fields.reduce((meta, field) => ({
    ...meta, [field]: (subject as Record<string, any>)[field]
  }), {}) as Partial<Subject>
}

export const extractIdFieldsFromCredential = <Subject extends {}>(
  schema: CredentialDescription, cred: UnsignedCredential<Subject>
) => extractIdFieldsFromSubject(schema, <Subject>singleValue(cred.credentialSubject))

export const updateDidIdWithKey = (
  helper: DIDHelper,
  schema: CredentialDescription,
  key: CryptoKey,
  did: DIDDocumentUnsinged,
  cred: UnsignedCredential
) => {
  const id = createVerifiableIdFromCredential(helper, schema, key, cred)
  const _updateId = (_id: string) => {
    const _desc = helper.parseDIDId(_id)
    return id + (_desc.fragment ? '#' + _desc.fragment : '')
  }
  if (did.id !== id) {
    did.id = id
    normalizeValue(did.verificationMethod).forEach(
      method => {
        if (method) {
          method.id = _updateId(method.id)
        }
      }
    )
    didPurposeList.forEach(purpose => {
      if (did[purpose]) {
        const methods = normalizeValue(did[purpose]).map(
          method => {
            if (typeof method === 'string') {
              return _updateId(method)
            } else if (method) {
              method.id = _updateId(method.id)
              return method
            }
          }
        )
        if (methods) {
          did[purpose] = simplifyValue(methods) as MaybeArray<DIDVerificationItem>
        }
      }
    })

    return true
  }

  return false
}