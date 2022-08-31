import { ReactNode, FunctionComponent } from "react"
import { EmptyProps } from "../../../../../common"


export type CredentialListInputProps = EmptyProps & {
  config: CredentialListConfig | CredentialListControl
}

export type CredentialListConfig = {
  items: CredentialListItemConfig[]
  prefix?: string
}

export type CredentialListItemConfig = {
  readOnly?: boolean
  type: string
  plural: boolean
  max: number
  field: string
  prefix?: string
}

export type CredentialListInputDetailsProps = EmptyProps & {
  config: CredentialListItemConfig
  control: CredentialListControl
}

export type CredentialListInputDetails = FunctionComponent<CredentialListInputDetailsProps>

export type CredentialListItemInputProps = EmptyProps & {
  config: CredentialListItemConfig
  control: CredentialListControl
}

export type CredentialListControl = {
  openDialog?: (open: boolean) => void
  setContent?: (content: ReactNode) => void
  renderFields: (ns?: string) => ReactNode[]
  setOpenDialogProvider: (callback: (open: boolean) => void) => void
  setDialogContentProvider: (callback: (content: ReactNode) => void) => void
  openDetails: (field: string | CredentialListItemConfig, ns?: string) => void
  closeDetails: () => void
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