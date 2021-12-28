import { CredentialDescription, ExtensionDetails, ExtensionFlow, ExtensionOnboarding, ExtensionSchema } from "./types";

export const buildExtensionSchema = <
  CredType extends string,
  FlowType extends string | undefined = undefined
>(
  details: ExtensionDetails,
  credentials: { [key in CredType]: CredentialDescription },
  flows?: FlowType extends string ? { [key in FlowType]: ExtensionFlow } : undefined
): ExtensionSchema<CredType, FlowType> => {
  const _schema: ExtensionSchema<CredType, FlowType> =
    typeof flows === 'undefined'
      ? {
        details,
        credentials,
      } as ExtensionSchema<CredType, FlowType>
      : {
        details,
        credentials,
        flows
      } as ExtensionSchema<CredType, FlowType>

  return _schema
}

export const addOnboardingToSchema = <
  CredType extends string,
  FlowType extends string
>(
  schema: ExtensionSchema<CredType, FlowType>,
  onboarding: ExtensionOnboarding<CredType, FlowType> | ExtensionOnboarding<CredType, FlowType>[]
): ExtensionSchema<CredType, FlowType> => {
  return {
    ...schema,
    onboardings: [
      ...(schema.onboardings || []),
      ...(Array.isArray(onboarding) ? onboarding : [onboarding])
    ]
  }
}