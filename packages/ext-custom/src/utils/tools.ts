import {
  CustomDescription, DEFAULT_SUFFIX_CLAIM, DEFAULT_SUFFIX_OFFER, DEFAULT_SUFFIX_REQUEST,
  DEFAULT_SUFFIX_RESPONSE
} from "../custom.types"


export const castClaimType = (cred: CustomDescription) =>
  cred.claimType || `${cred.mainType}${DEFAULT_SUFFIX_CLAIM}`

export const castOfferType = (cred: CustomDescription) =>
  cred.offerType || `${cred.mainType}${DEFAULT_SUFFIX_OFFER}`

export const castRequestType = (cred: CustomDescription) =>
  cred.requestType || `${cred.mainType}${DEFAULT_SUFFIX_REQUEST}`

export const castResponseType = (cred: CustomDescription) =>
  cred.responseType || `${cred.mainType}${DEFAULT_SUFFIX_RESPONSE}`