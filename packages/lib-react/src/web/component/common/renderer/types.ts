import { createContext, PropsWithChildren, ReactNode } from "react"
import { TFunction } from "i18next"

export type EntityParams<Subject extends {}> = {
  t: TFunction
  entity: string
  subject: Subject
  title?: string | ReactNode
}

export type EntityProps<Subject extends {}> = PropsWithChildren<EntityParams<Subject>>

export type EntityItemProps<Subject extends {}, Params extends {}> =
  PropsWithChildren<Partial<EntityParams<Subject>> & Params>

export type EntityContextParams<Subject extends {}> = {
  subject?: Subject
  t?: TFunction
  entity: string
}

export const EntityContext = createContext<EntityContextParams<{ [key: string]: any }>>({ entity: 'credential' })

export const EntityContextConsumer = EntityContext.Consumer