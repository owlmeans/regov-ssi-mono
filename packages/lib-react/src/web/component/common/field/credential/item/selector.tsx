import React, { useState } from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import { normalizeValue } from "@owlmeans/regov-ssi-core"
import { useTranslation } from 'react-i18next'
import { CredentialListItemConfig, CredentialListItemTypeSelectorProps } from '../types'
import { useRegov } from '../../../../../../common'


export const CredentialListItemTypeSelector = ({ control, ns }: CredentialListItemTypeSelectorProps) => {
  const config = control.getMainConfig()
  const { t } = useTranslation(ns)
  const prefix = `input.${config.prefix ? `${config.prefix}.` : ''}`
  const itemConfig = config.items.find(item => item.field === control.field) as CredentialListItemConfig

  const { extensions } = useRegov()
  const [open, setOpen] = useState(false)

  return <ListItem>
    <ListItemButton onClick={() => setOpen(true)}>{t(`${prefix}selectType`)}</ListItemButton>
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>{t(`${prefix}typeSelector.title`)}</DialogTitle>
      <DialogContent>
        <List>
          {extensions?.registry.extensions.flatMap(
            ext => normalizeValue(Object.entries(ext.schema.credentials || {})).filter(
              ([, cred]) => {
                if (!itemConfig.type) {
                  return cred.arbitraryEvidence
                }
                const types = normalizeValue(itemConfig.type)
                return types.includes(cred.mainType)
                  || types.some(type => cred.mandatoryTypes && cred.mandatoryTypes.includes(type))
              }
            ).map(([, cred]) => cred)
          ).map(cred => {
            const ext = extensions.getExtension(cred.mainType)

            const TypeToSelect = () => {
              const { t: ti } = useTranslation(ext.extension.localization?.ns)
              return <ListItem>
                <ListItemButton onClick={() => {
                  setOpen(false)
                  control.setType(cred.mainType)
                }}>{ti(cred.defaultNameKey || cred.mainType)}</ListItemButton>
              </ListItem>
            }

            return <TypeToSelect key={`${ext.extension.schema.details.code}.${cred.mainType}`}/>
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>{t(`${prefix}typeSelector.close`)}</Button>
      </DialogActions>
    </Dialog>
  </ListItem>
}
