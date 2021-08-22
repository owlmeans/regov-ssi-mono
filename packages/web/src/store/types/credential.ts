
import { PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
import { DIDDocument, DIDDocumentUnsinged } from 'metabelarusid-did'
import { FreeFormCredential, UnsignedFreeFormCredential } from '../../model/types'

export type CredentialState = {
  currentClaim?: CredentialClaimState
  claim?: CredentialClaimState
  signed?: SignedCredentialState
}

export type CredentialClaimState = {
  credential: UnsignedFreeFormCredential
  did: DIDDocumentUnsinged
}

export type SignedCredentialState = {
  credential: FreeFormCredential
  did: DIDDocument
}


export type CredentialReducers = SliceCaseReducers<CredentialState> & {
  claim: (state: CredentialState, action: PayloadAction<CredentialClaimState>) => CredentialState

  cleanUpClaim: (state: CredentialState) => CredentialState

  review: (state: CredentialState, action: PayloadAction<CredentialClaimState>) => CredentialState

  sign: (state: CredentialState, action: PayloadAction<SignedCredentialState>) => CredentialState
}