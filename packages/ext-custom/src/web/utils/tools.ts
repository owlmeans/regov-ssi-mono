import { CustomDescription } from "../../custom.types";


export const castSectionKey = (descr: CustomDescription) =>
  descr.typeAlias || descr.mainType.toLowerCase()