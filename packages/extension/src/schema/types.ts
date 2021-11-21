import { BasicCredentialType, MultiSchema } from "@owlmeans/regov-ssi-core"


export type ExtensionSchema<
  CredType extends string,
  FlowType extends string | undefined = undefined
  > = FlowType extends string ? {
    flows: { [key in FlowType]: ExtensionFlow }
    onboardings: ExtensionOnboarding<CredType, FlowType>[]
  } & BasicExtensionFields<CredType>
  : BasicExtensionFields<CredType>

type BasicExtensionFields<CredType extends string> = {
  details: ExtensionDetails
  credentials: { [key in CredType]: CredentialSchema }
}

export type ExtensionDetails = {
  name: string
  code: string
  organization?: string
  home?: string
}

export type CredentialSchema<
  Evidance extends {} = any,
  Schema extends {} = any
  > = {
    credentialContext: MultiSchema,
    contextUrl?: string
    mainType: string
    mandatoryTypes?: BasicCredentialType
    evidence?: Evidance | Evidance[]
    credentialSchema?: Schema | Schema[]
    registryType?: string

    withSource?: boolean
    claimable?: boolean
    listed?: boolean
    selfIssuing?: boolean
  }

export type ExtensionOnboarding<
  CredType extends string,
  FlowType extends string
  > = {
    creds: CredType[]
    flow: FlowType
  }

export type ExtensionFlow = {
  type: string
  initialStep: ExtensionFlowStep
  steps: { [key: string]: ExtensionFlowStep }
}

export type ExtensionFlowStep = {
  previous?: string
  next?: string
  changeStateMethod?: string
  type: string
}