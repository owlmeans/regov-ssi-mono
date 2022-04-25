import { Extension } from "@owlmeans/regov-ssi-core"
import { ProduceRouter, ServerExtension } from "./types"


export const buildServerExtension = (extension: Extension, produceRouter: ProduceRouter) => {
  const _extension: ServerExtension = {
    extension,

    produceRouter
  }

  return _extension
}