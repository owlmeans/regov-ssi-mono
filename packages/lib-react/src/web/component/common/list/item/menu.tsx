/**
 *  Copyright 2022 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { Dispatch, Fragment, PropsWithChildren, SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import saveAs from 'file-saver'
import copy from 'copy-to-clipboard'
import { i18n } from 'i18next'
import { useRegov } from '../../../../../common/'
import { RegistryType } from '@owlmeans/regov-ssi-core'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Delete from '@mui/icons-material/Delete'
import FileDownload from '@mui/icons-material/FileDownload'
import MenuOpen from '@mui/icons-material/MenuOpen'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Grid3x3Icon from '@mui/icons-material/Grid3x3';


export const ItemMenu = ({ i18n, meta, handle, content, prettyOutput, exportTitle, children }: ItemMenuParams) => {
  const { t } = useTranslation('regov-wallet-main', { i18n })
  const [anchor, setAnchor] = useState<HTMLElement | undefined>(undefined)
  const { handler } = useRegov()
  if (typeof content === 'object') {
    content = JSON.stringify(content, undefined, prettyOutput ? 2 : undefined)
  }
  const _content = content as string
  handle.handler = {
    setAnchor, close: () => { setAnchor(undefined) }
  }

  const remove = meta && (async () => {
    const registry = handler.wallet?.getRegistry(meta.registry)
    const idx = registry?.registry.credentials[meta.section].findIndex(
      cred => cred.credential.id === meta.id
    )
    if (idx !== undefined && idx > -1) {
      registry?.registry.credentials[meta.section].splice(idx, 1)
      handler.notify()
    }
  })

  if (!anchor) {
    return <Fragment />
  }

  return <ClickAwayListener onClickAway={event => {
    event.stopPropagation()
    handle.handler?.close()
  }}>
    <Menu open={!!anchor} anchorEl={anchor} onClose={handle.handler.close}>
      {remove && <MenuItem onClick={remove}>
        <ListItemIcon>
          <Delete fontSize="medium" />
        </ListItemIcon>
        <ListItemText primary={t('menu.action.delete.title')} />
      </MenuItem>}
      <MenuItem onClick={() => {
        copy(_content, {
          message: t([`widget.dashboard.clipboard.copyhint`, 'clipboard.copyhint']),
          format: 'text/plain'
        })
        handle.handler?.close()
      }}>
        <ListItemIcon>
          <ContentCopy fontSize="medium" />
        </ListItemIcon>
        <ListItemText primary={t('menu.action.copy.title')} />
      </MenuItem>
      {meta && <MenuItem onClick={() => {
        copy(meta.id, {
          message: t([`widget.dashboard.clipboard.copyhint`, 'clipboard.copyhint']),
          format: 'text/plain'
        })
        handle.handler?.close()
      }}>
        <ListItemIcon>
          <Grid3x3Icon fontSize="medium" />
        </ListItemIcon>
        <ListItemText primary={t('menu.action.copyId.title')} />
      </MenuItem>}
      {exportTitle &&
        <MenuItem onClick={() => {
          saveAs(new Blob([_content], { type: "text/plain;charset=utf-8" }), `${exportTitle}.json`)
          handle.handler?.close()
        }}>
          <ListItemIcon>
            <FileDownload fontSize="medium" />
          </ListItemIcon>
          <ListItemText primary={t('menu.action.export.title')} />
        </MenuItem>
      }
      {children}
    </Menu>
  </ClickAwayListener>
}

export type ItemMenuParams = PropsWithChildren<{
  handle: ItemMenuHandle
  content: string | Object
  prettyOutput?: boolean
  exportTitle?: string
  meta?: ItemMenuMeta
  i18n: i18n
}>

export type ItemMenuMeta = {
  id: string
  registry: RegistryType
  section: string
}

export type ItemMenuHandle = {
  handler: undefined | {
    setAnchor: Dispatch<SetStateAction<HTMLElement | undefined>>
    close: () => void
  }
}

export const MenuIconButton = ({ handle }: MenuIconButtonParams) => {
  return <IconButton size="large" color="primary" edge="end" onClick={event => {
    event.stopPropagation()
    handle.handler?.setAnchor(event.currentTarget)
  }}>
    <MenuOpen fontSize="inherit" />
  </IconButton>
}

export type MenuIconButtonParams = {
  handle: ItemMenuHandle
}