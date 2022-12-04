import { CustomDescription } from "../../custom.types"
import { castSectionKey } from "./tools"


export const makeClaimPreviewPath = (descr: CustomDescription, id?: string) =>
  `${id ? '/' : ''}custom/${castSectionKey(descr)}/claim/previw/${id ? id : ':id'}`