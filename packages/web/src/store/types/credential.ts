
import { PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
import { DIDDocument, DIDDocumentUnsinged } from 'metabelarusid-did'
import { FreeFormCredential, IdentityPassport, UnsignedFreeFormCredential } from '../../model/types'

export type CredentialState = {
  currentClaim?: CredentialClaimState
  claim?: CredentialClaimState
  signed?: SignedCredentialState
  credential?: SignedCredentialStateWithErrors
}

export type CredentialClaimState = {
  credential: UnsignedFreeFormCredential
  did: DIDDocumentUnsinged
}

export type SignedCredentialState = {
  credential: FreeFormCredential
  did: DIDDocument
}

export type SignedCredentialStateWithErrors = SignedCredentialState & {
  errors?: string[],
  issuer?: IdentityPassport
}


export type CredentialReducers = SliceCaseReducers<CredentialState> & {
  claim: (state: CredentialState, action: PayloadAction<CredentialClaimState>) => CredentialState

  cleanUp: (state: CredentialState) => CredentialState

  review: (state: CredentialState, action: PayloadAction<CredentialClaimState>) => CredentialState

  sign: (state: CredentialState, action: PayloadAction<SignedCredentialState>) => CredentialState

  verify: (state: CredentialState, action: PayloadAction<SignedCredentialStateWithErrors>) => CredentialState
}