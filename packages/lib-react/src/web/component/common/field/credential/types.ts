import { MaybeArray, RegistryItem } from "@owlmeans/regov-ssi-core"
import { ReactNode, FunctionComponent } from "react"
import { EmptyProps } from "../../../../../common"


export type CredentialListInputProps = EmptyProps & {
  field: string
  config: CredentialListConfig | CredentialListControl
}

export type CredentialListConfig = {
  items: CredentialListItemConfig[]
  prefix?: string
}

export type CredentialListItemConfig = {
  readOnly?: boolean
  type?: MaybeArray<string>
  plural?: boolean
  max?: number
  field: string
  prefix?: string
  arbitraryEvidence?: boolean
}

export type CredentialListItemControl = {
  field: string
  index?: number
  type?: MaybeArray<string>
  value?: RegistryItem
  getMainConfig: () => CredentialListConfig
  getType: () => undefined | MaybeArray<string>
  setType: (type: MaybeArray<string>) => void
  setValue: (value: RegistryItem) => void
}

export type CredentialListInputDetailsProps<Item extends RegistryItem = RegistryItem> = EmptyProps & {
  config: CredentialListItemConfig
  control: CredentialListControl
  index?: number
  close?: () => void
  finish?: (claim: Item) => void
}

export type CredentialListInputDetails<
  Item extends RegistryItem = RegistryItem,
  Props extends CredentialListInputDetailsProps<Item> = CredentialListInputDetailsProps<Item>
> = FunctionComponent<Props>

export type CredentialListItemInputProps = EmptyProps & {
  index?: number
  config: CredentialListItemConfig
  control: CredentialListControl
}

export type CredentialListItemTypeSelectorProps = EmptyProps & {
  control: CredentialListItemControl
}

export type CredentialListControl = {
  openDialog?: (open: boolean) => void
  setContent?: (content: ReactNode) => void
  renderFields: (ns?: string) => ReactNode[]
  setOpenDialogProvider: (callback: (open: boolean) => void) => void
  setDialogContentProvider: (callback: (content: ReactNode) => void) => void
  openDetails: (field: string | CredentialListItemConfig, index?: number, ns?: string) => void
  closeDetails: () => void
  getItemControl: (field: string, index?: number) => CredentialListItemControl
  setNotifier: (notifier: () => void) => void
  getValues: () => { [key: string]: MaybeArray<RegistryItem> }
}

export const isCredentialListControl = (obj: Object): obj is CredentialListControl => obj && 'renderFields' in obj

export type CredentialListItemInputRenderer = FunctionComponent<CredentialListItemInputRendererProps>

export type CredentialListItemInputRendererProps = EmptyProps & CredentialListItemInputProps & {
  control: CredentialListControl
}

export type CredentialListInputPopupProps = {
  control: CredentialListControl
}

export const ERROR_CREDENTIAL_INPUT_NO_FIELD = 'ERROR_CREDENTIAL_INPUT_NO_FIELD'