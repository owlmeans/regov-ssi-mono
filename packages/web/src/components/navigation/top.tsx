import { AppBar, Toolbar, Typography, Grid, Button, ButtonBase, Link } from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'
import { compose } from 'recompose'

import { RouteComponentProps, withRouter } from 'react-router-dom'
import { saveAs } from 'file-saver'
import { EncryptedStore } from 'metabelarusid-core'

import { RootState } from '../../store/types'
import { withWallet } from '../../model/context'
import { NavigationMainRedirect } from './main-redirect'
import { storeActions } from '../../store'
import { PropsWithWallet } from '../../model/types'


const connector = connect(
  ({ store: { current, stores, uncommited } }: RootState, props) => {
    return {
      name: current && stores[current]?.name,
      store: stores[current],
      uncommited,
      ...props
    }
  },
  (dispatch, props: PropsWithWallet & StoreProps) => {
    return {
      commit: async () => {
        dispatch(storeActions.update(await props.wallet.export()))
      },
      save: async (store) => {
        saveAs(new Blob(
          [JSON.stringify(store)],
          { type: "text/plain;charset=utf-8" }
        ), `${store.name}.metaid`)
      },
      ...props
    }
  }
)

type StoreProps = {
  store: EncryptedStore
}

export const NavigationTop = compose(withWallet, withRouter, connector)(
  ({ name, uncommited, store, commit, save, history, wallet }: ConnectedProps<typeof connector>
    & RouteComponentProps & PropsWithWallet) => {
    return wallet ? <AppBar position="fixed">
      <Toolbar>
        <Grid container item
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Link color="inherit"
            onClick={() => history.push('/')}>
            <Typography variant="h5">Meta-ID</Typography>
          </Link>
        </Grid>
        {
          name ? <Grid container item
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={3}>
            <Grid item>
              <ButtonBase onClick={() => history.push('/wallet')}>
                <Typography variant="h6">{name}</Typography>
              </ButtonBase>
            </Grid>
            {
              uncommited
                ? <Grid item>
                  <Button size="small" variant="contained" color="secondary"
                    onClick={commit}>Сохранить</Button>
                </Grid>
                : <Grid item>
                  <Button size="small" variant="contained"
                    onClick={() => save(store)}>Экспортировать</Button>
                </Grid>
            }
          </Grid>
            : undefined
        }
      </Toolbar>
    </AppBar> : <NavigationMainRedirect />

  }
)
