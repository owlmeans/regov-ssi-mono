import { addToValue, MaybeArray, normalizeValue } from "@owlmeans/regov-ssi-common";
import { CredentialDescription, ExtensionDetails, ExtensionEvent, ExtensionSchema } from "./types";

export const buildExtensionSchema = <CredType extends string>(
  details: ExtensionDetails,
  credentials: { [key in CredType]: CredentialDescription },
): ExtensionSchema<CredType> => {
  const _schema = {
    details,
    credentials,
  }

  return _schema
}

export const addObserverToSchema = <CredType extends string>(
  schema: ExtensionSchema<CredType>,
  event: MaybeArray<ExtensionEvent<CredType>>
): ExtensionSchema<CredType> => ({
  ...schema, events: normalizeValue(addToValue(schema.events, event))
})