import { buildUIExtension } from "@owlmeans/regov-lib-react";
import { authExtension } from "../../ext";


export const authIntegratedExtension = buildUIExtension(authExtension, (_) => {
  return []
})