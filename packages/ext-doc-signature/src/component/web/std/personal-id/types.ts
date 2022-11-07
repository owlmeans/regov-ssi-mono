import { CredentialListInputDetailsProps } from "@owlmeans/regov-lib-react"
import { PersonalIdSubject, RegovStdPersonalIdClaim } from "../../../../types"


export type PersonalIdClaimProps = CredentialListInputDetailsProps<RegovStdPersonalIdClaim>

export type PresonalIdClaimFields = {
  std: {
    personalId: PersonalIdSubject
    presonalIdAux: {
      alert: string
    }
  }
}