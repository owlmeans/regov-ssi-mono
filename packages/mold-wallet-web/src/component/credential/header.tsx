import React, {
  Fragment,
  useState
} from 'react'
import {
  castMenuItemParams,
  CredentialListNavigator,
  EmptyProps,
  RegovCompoentProps,
  useNavigator,
  useRegov,
  withRegov
} from '@owlmeans/regov-lib-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList
} from '@mui/material'
import {
  MENU_TAG_CRED_NEW, NewCredentailMenuItem
} from '../../extension/types'
import { AddCircleOutline } from '@mui/icons-material'


export const CredentialHeader = withRegov<
  CredentialHeaderProps, CredentialListNavigator
>({ namespace: 'regov-wallet-credential' }, ({
  t
}) => {
  const navigator = useNavigator<CredentialListNavigator>()
  const { extensions } = useRegov()
  const createMenuList = extensions?.getMenuItems(MENU_TAG_CRED_NEW)
  const [openCreation, setOpenCreation] = useState<boolean>(false)

  return <Fragment>
    <Grid container direction="row" justifyContent="flex-end" alignItems="flex-start">
      <Grid item>
        <Button variant="outlined" color="primary"
          onClick={() => setOpenCreation(true)}>{t('header.create')}</Button>
      </Grid>
    </Grid>
    <Dialog open={openCreation} scroll="paper" onClose={() => setOpenCreation(false)}>
      <DialogTitle>{t('header.create-dialog.title')}</DialogTitle>
      <DialogContent>
        <MenuList>
          {
            createMenuList?.map(
              item => {
                return <MenuItem key={item.title} onClick={
                  async () => {
                    const res = await castMenuItemParams(item)
                    if (res && res.params && navigator.create) {
                      const params = res.params as NewCredentailMenuItem
                      navigator.create(`${params.ext}/${params.type}`)
                    }
                  }
                }>
                  <ListItemIcon><AddCircleOutline fontSize="small" /></ListItemIcon>
                  <ListItemText>{t(item.title, { ns: item.ns })}</ListItemText>
                </MenuItem>
              }
            )
          }
        </MenuList>
      </DialogContent>
    </Dialog>
  </Fragment>
})


export type CredentialHeaderProps = RegovCompoentProps<EmptyProps>