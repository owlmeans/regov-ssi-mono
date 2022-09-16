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

import React, { Fragment, FunctionComponent, useState } from 'react'
import {
  castMenuItemParams, CredentialListNavigator, EmptyProps, ManuItemParams, MenuActionResult, RegovComponentProps,
  useNavigator, useRegov, withRegov
} from '../../../common'
import { MENU_TAG_CLAIM_NEW, MENU_TAG_CRED_NEW, MENU_TAG_REQUEST_NEW, NewCredentailMenuItem } from '../../extension/types'
import { TFunction } from 'i18next'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import Drafts from '@mui/icons-material/Drafts'
import SvgIcon from '@mui/material/SvgIcon'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'


type SvgIconComponent = typeof SvgIcon

export const CredentialHeader = withRegov<
  CredentialHeaderProps, CredentialListNavigator
>({ namespace: 'regov-wallet-credential' }, ({
  t
}) => {
  const navigator = useNavigator<CredentialListNavigator>()
  const { extensions } = useRegov()
  const createMenuList = extensions?.getMenuItems(MENU_TAG_CRED_NEW)
  const requestMenuList = extensions?.getMenuItems(MENU_TAG_REQUEST_NEW)
  const claimMenuList = extensions?.getMenuItems(MENU_TAG_CLAIM_NEW)
  const [openCreation, setOpenCreation] = useState<boolean>(false)
  const [openRequest, setOpenRequest] = useState<boolean>(false)
  const [openClaim, setOpenClaim] = useState<boolean>(false)

  return <Fragment>
    <Grid container direction="row" justifyContent="flex-end" alignItems="flex-start" columnSpacing={2}
      maxWidth="100%">
      <Grid item>
        <Button variant="outlined" color="primary"
          onClick={() => setOpenCreation(true)}>{`${t('header.create')}`}</Button>
      </Grid>
      <Grid item>
        <Button variant="outlined" color="primary"
          onClick={() => setOpenRequest(true)}>{`${t('header.request')}`}</Button>
      </Grid>
      <Grid item>
        <Button variant="outlined" color="primary"
          onClick={() => setOpenClaim(true)}>{`${t('header.claim')}`}</Button>
      </Grid>
    </Grid>
    <HeaderMenu open={openCreation} t={t} setOpen={setOpenCreation} menuList={createMenuList}
      Icon={AddCircleOutline} title="header.create-dialog.title" action={async res => {
        if (res.params && navigator.create) {
          const params = res.params as NewCredentailMenuItem
          navigator.create(`${params.ext}/${params.type}`)
        }
      }} />
    <HeaderMenu open={openRequest} t={t} setOpen={setOpenRequest} menuList={requestMenuList}
      Icon={Drafts} title="header.request-dialog.title" action={async res => {
        if (res.params && navigator.request) {
          const params = res.params as NewCredentailMenuItem
          navigator.request(`${params.ext}/${params.type}`)
        }
      }} />
    <HeaderMenu open={openClaim} t={t} setOpen={setOpenClaim} menuList={claimMenuList}
      Icon={Drafts} title="header.claim-dialog.title" action={async res => {
        if (res.params && navigator.claim) {
          const params = res.params as NewCredentailMenuItem
          navigator.claim(`${params.ext}/${params.type}`)
        }
      }} />
  </Fragment>
})

const HeaderMenu: FunctionComponent<HeaderMenuProps> = ({ t, title, open, setOpen, menuList, action, Icon }) => {
  return <Dialog open={open} scroll="paper" onClose={() => setOpen(false)}>
    <DialogTitle>{`${t(title)}`}</DialogTitle>
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
                <ListItemText>{`${t(item.title, { ns: item.ns })}`}</ListItemText>
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