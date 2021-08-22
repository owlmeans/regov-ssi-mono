import { AppBar, Toolbar, Typography, Grid, Button, ButtonBase } from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'
import { compose } from 'recompose'

import { RootState } from '../../store/types'
import { withWallet } from '../../model/context'
import { NavigationMainRedirect } from './main-redirect'
import { storeActions } from '../../store'
import { PropsWithWallet } from '../../model/types'
import { RouteComponentProps, withRouter } from 'react-router-dom'


const connector = connect(
  ({ store: { current, stores, uncommited } }: RootState, props) => {
    return {
      name: current && stores[current]?.name,
      uncommited,
      ...props
    }
  },
  (dispatch, props: PropsWithWallet) => {
    return {
      commit: async () => {
        dispatch(storeActions.update(await props.wallet.export()))
      },
      ...props
    }
  }
)

export const NavigationTop = compose(withWallet, withRouter, connector)(
  ({ name, uncommited, commit, history, wallet }: ConnectedProps<typeof connector>
    & RouteComponentProps & PropsWithWallet) => {
    return wallet ? <AppBar position="fixed">
      <Toolbar>
        <Grid container item
          direction="row"
          justifyContent="space-between"
          alignItems="center">
          <Typography variant="h5">Meta-ID</Typography>
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
                  <Button size="small" variant="contained" onClick={commit}>Сохранить</Button>
                </Grid>
                : undefined
            }
          </Grid>
            : undefined
        }
      </Toolbar>
    </AppBar> : <NavigationMainRedirect />

  }
)
