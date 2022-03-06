import React, { Fragment, FunctionComponent, useState } from 'react'
import {
  castMenuItemParams, CredentialListNavigator, EmptyProps, ManuItemParams, MenuActionResult, RegovComponentProps,
  useNavigator, useRegov, withRegov
} from '../../../common'
import {
  Button, Dialog, DialogContent, DialogTitle, Grid, ListItemIcon, ListItemText, MenuItem,
  MenuList
} from '@mui/material'
import {
  MENU_TAG_CRED_NEW, MENU_TAG_REQUEST_NEW, NewCredentailMenuItem
} from '../../extension/types'
import { AddCircleOutline, Drafts, SvgIconComponent } from '@mui/icons-material'
import { TFunction } from 'i18next'


export const CredentialHeader = withRegov<
  CredentialHeaderProps, CredentialListNavigator
>({ namespace: 'regov-wallet-credential' }, ({
  t
}) => {
  const navigator = useNavigator<CredentialListNavigator>()
  const { extensions } = useRegov()
  const createMenuList = extensions?.getMenuItems(MENU_TAG_CRED_NEW)
  const requestMenuList = extensions?.getMenuItems(MENU_TAG_REQUEST_NEW)
  const [openCreation, setOpenCreation] = useState<boolean>(false)
  const [openRequest, setOpenRequest] = useState<boolean>(false)

  return <Fragment>
    <Grid container direction="row" justifyContent="flex-end" alignItems="flex-start" columnSpacing={2}>
      <Grid item>
        <Button variant="outlined" color="primary"
          onClick={() => setOpenCreation(true)}>{t('header.create')}</Button>
      </Grid>
      <Grid item>
        <Button variant="outlined" color="primary"
          onClick={() => setOpenRequest(true)}>{t('header.request')}</Button>
      </Grid>
    </Grid>
    <HeaderMenu open={openCreation} t={t} setOpen={setOpenCreation} menuList={createMenuList}
      Icon={AddCircleOutline} title="header.create-dialog.title" action={async res => {
        if (res.params && navigator.create) {
          const params = res.params as NewCredentailMenuItem
          navigator.create(`${params.ext}/${params.type}`)
        }
      }}/>
    <HeaderMenu open={openRequest} t={t} setOpen={setOpenRequest} menuList={requestMenuList} 
      Icon={Drafts} title="header.request-dialog.title" action={async res => {
        if (res.params && navigator.request) {
          const params = res.params as NewCredentailMenuItem
          navigator.request(`${params.ext}/${params.type}`)
        }
      }}/>
  </Fragment>
})

const HeaderMenu: FunctionComponent<HeaderMenuProps> = ({ t, title, open, setOpen, menuList, action, Icon }) => {
  return <Dialog open={open} scroll="paper" onClose={() => setOpen(false)}>
    <DialogTitle>{t(title)}</DialogTitle>
    <DialogContent>
      <MenuList>
        {
          menuList?.map(
            item => {
              return <MenuItem key={item.title} onClick={
                async () => {
                  const res = await castMenuItemParams(item)
                  if (res) {
                    action(res)
                  }
                }
              }>
                <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
                <ListItemText>{t(item.title, { ns: item.ns })}</ListItemText>
              </MenuItem>
            }
          )
        }
      </MenuList>
    </DialogContent>
  </Dialog>
}

type HeaderMenuProps = {
  open: boolean
  setOpen: (value: boolean) => void
  t: TFunction
  menuList: undefined | ManuItemParams[]
  action: (params: MenuActionResult) => Promise<void>
  title: string
  Icon: SvgIconComponent
}


export type CredentialHeaderProps = RegovComponentProps<EmptyProps>