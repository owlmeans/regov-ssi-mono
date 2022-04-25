import { Extension } from "@owlmeans/regov-ssi-core"
import { Router } from "express"


export type ServerExtension = {
  extension: Extension

  produceRouter: ProduceRouter
}

export type ProduceRouter = () => Router | undefined
