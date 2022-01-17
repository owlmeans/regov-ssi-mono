import { Extension } from "@owlmeans/regov-ssi-extension"

export const REGOV_CREDENTIAL_TYPE_GROUP = 'OwlMeans:Regov:Group'

export const REGOV_CREDENTIAL_TYPE_MEMBERSHIP = 'OwlMeans:Regov:Group:Membership'

export const BASIC_IDENTITY_TYPE = 'Identity'

export const REGOV_EXT_GROUP_NAMESPACE = 'owlmeans-regov-ext-groups'

export type RegovGroupCredential = typeof REGOV_CREDENTIAL_TYPE_GROUP
export type RegovGroupMembershipCredential = typeof REGOV_CREDENTIAL_TYPE_MEMBERSHIP

export type RegovGroupExtensionTypes = RegovGroupCredential | RegovGroupMembershipCredential

export type GroupSubject = {
  uuid: string
  name: string
  description: string
  createdAt: string
}

export type RegovGroupExtension = Extension<RegovGroupExtensionTypes>