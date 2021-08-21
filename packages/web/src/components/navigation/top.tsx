import { Box, AppBar, Toolbar, Typography, Grid } from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'
import { compose } from 'recompose'

import { RootState } from '../../store/types'
import { withWallet } from '../../model/context'
import { WalletWrapper } from 'metabelarusid-core'


const connector = connect(
  ({ store: { current, stores } }: RootState, props) => {
    return {
      name: current && stores[current]?.name,
      ...props
    }
  }
)

export const NavigationTop = compose(connector, withWallet)(
  ({ name, wallet }: ConnectedProps<typeof connector> & { wallet: WalletWrapper }) => {
    return <Box>
      <AppBar position="fixed">
        <Toolbar>
          <Grid container
            direction="row"
            justifyContent="space-between"
            alignItems="center">
            <Grid item>
              <Typography variant="h5">Meta-ID</Typography>
            </Grid>
            {
              wallet && name ? <Grid item><Typography variant="h6">{name}</Typography></Grid>
                : undefined
            }
          </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  }
)
