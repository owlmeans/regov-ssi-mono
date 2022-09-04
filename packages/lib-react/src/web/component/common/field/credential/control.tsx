import React, { Fragment } from "react"
import { useTranslation } from "react-i18next"
import {
  EXRENSION_ITEM_PURPOSE_INPUT_DETAILS, UIExtensionFactoryProduct, UIExtensionRegistry
} from "../../../../../extension"
import { CredentialListItemInput } from "./item"
import {
  CredentialListConfig, CredentialListControl, CredentialListInputDetailsProps, CredentialListItemConfig, CredentialListItemControl, ERROR_CREDENTIAL_INPUT_NO_FIELD
} from "./types"


export const buildCredentialListControl = (config: CredentialListConfig, extensions?: UIExtensionRegistry) => {
  const _items: { [key: string]: CredentialListItemControl } = {}

  let _notify: undefined | (() => void)

  const control: CredentialListControl = {
    renderFields: ns => {
      return config.items.flatMap(item => {
        if (item.plural) {
          return Array.from(Array(item.max).keys()).map(
            key => <CredentialListItemInput
              key={`${item.field}[${key}]`} control={control} ns={ns} index={key}
              config={{ ...item, prefix: item.prefix || config.prefix }} />
          )
        }
        return []
      })
    },

    openDetails: (field, ns) => {
      const _field = typeof field === 'string' ? config.items.find(item => item.field === field) : field
      if (!_field) {
        throw new Error(ERROR_CREDENTIAL_INPUT_NO_FIELD)
      }
      const coms = extensions?.produceComponent(
        EXRENSION_ITEM_PURPOSE_INPUT_DETAILS, _field.type
      ) as UIExtensionFactoryProduct<CredentialListInputDetailsProps>[]
      const props = { config: _field, control, ns }
      if (coms.length) {
        const Renderer = coms[0].com

        control.setContent && control.setContent(<Renderer {...props} />)
      } else {
        const DefaultDialog = () => {
          const { t } = useTranslation(ns)

          return <Fragment>{
            t(`input.${props.config.prefix ? `${props.config.prefix}.` : ''}${props.config.field}`)
          }</Fragment>
        }
        control.setContent && control.setContent(<DefaultDialog />)
      }
      control.openDialog && control.openDialog(true)
    },

    getItemControl: (field, index) => {
      const key = `${field}${index !== undefined ? `.${index}` : ''}`
      if (!_items[key]) {
        const itemConfig = config.items.find(item => item.field === field) as CredentialListItemConfig

        _items[key] = {
          field,
          index,
          getMainConfig: () => config,
          getType: () => _items[key].type || (!itemConfig.arbitraryEvidence ? itemConfig.type : undefined),
          setType: type => {
            _items[key].type = type
            _notify && _notify()
          }
        }
      }

      return _items[key]
    },

    closeDetails: () => control.openDialog && control.openDialog(false),

    setOpenDialogProvider: callback => control.openDialog = callback,

    setDialogContentProvider: callback => control.setContent = callback,

    setNotifier: notifier => _notify = notifier
  }

  return control
}