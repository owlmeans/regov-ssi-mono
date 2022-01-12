
export const REGOV_CREDENTIAL_TYPE_GROUP = 'OwlMeans:Regov:Group'

export const REGOV_CREDENTIAL_TYPE_MEMBERSHIP = 'OwlMeans:Regov:Group:Membership'

export const BASIC_IDENTITY_TYPE = 'Identity'

export type RegovGroupCredential = typeof REGOV_CREDENTIAL_TYPE_GROUP
export type RegovGroupMembershipCredential = typeof REGOV_CREDENTIAL_TYPE_MEMBERSHIP

export type RegovGroupExtensionTypes = RegovGroupCredential | RegovGroupMembershipCredential