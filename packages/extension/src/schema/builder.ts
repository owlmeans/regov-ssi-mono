import { addToValue, normalizeValue } from "@owlmeans/regov-ssi-common";
import { CredentialDescription, ExtensionDetails, ExtensionFlow, ExtensionEvent, ExtensionSchema } from "./types";

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

export const addObserverToSchema = <CredType extends string, FlowType extends string>(
  schema: ExtensionSchema<CredType, FlowType>,
  event: ExtensionEvent<FlowType> | ExtensionEvent<FlowType>[]
): ExtensionSchema<CredType, FlowType> => ({
  ...schema, events: normalizeValue(addToValue(schema.events, event))
})