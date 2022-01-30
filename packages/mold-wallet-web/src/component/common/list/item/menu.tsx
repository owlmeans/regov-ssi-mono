import React, {
  Dispatch,
  Fragment,
  PropsWithChildren,
  SetStateAction,
  useState
} from 'react'
import {
  ClickAwayListener,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import saveAs from 'file-saver'
import copy from 'copy-to-clipboard'
import { ContentCopy, FileDownload, MenuOpen } from '@mui/icons-material'
import { i18n } from 'i18next'


export const ItemMenu = ({ i18n, handle, content, prettyOutput, exportTitle, children }: ItemMenuParams) => {
  const { t } = useTranslation('regov-wallet-main', { i18n })
  const [anchor, setAnchor] = useState<HTMLElement | undefined>(undefined)
  if (typeof content === 'object') {
    content = JSON.stringify(content, undefined, prettyOutput ? 2 : undefined)
  }
  const _content = content as string
  handle.handler = {
    setAnchor, close: () => { setAnchor(undefined) }
  }

  if (!anchor) {
    return <Fragment />
  }

  return <ClickAwayListener onClickAway={event => {
    event.stopPropagation()
    handle.handler?.close()
  }}>
    <Menu open={!!anchor} anchorEl={anchor} onClose={handle.handler.close}>
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
  i18n: i18n
}>

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