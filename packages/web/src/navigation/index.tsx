
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom"

import { Box, makeStyles } from '@material-ui/core'

import { NavigationMainRedirect, NavigationTop } from '../components'

import { StoreNavigation } from "./store"
import { WalletNavigation } from "./wallet"


export const RootNavigation = () => {
  const classes = useStyles()

  return <Router>
    <Box>
      <NavigationTop />
      <Box className={classes.content}>
        <Switch>
          <Route exact path="/">
            <NavigationMainRedirect />
          </Route>
          <Route path="/store">
            <StoreNavigation />
          </Route>
          <Route path="/wallet">
            <WalletNavigation />
          </Route>
        </Switch>
      </Box>
    </Box>
  </Router>
}

const useStyles = makeStyles({
  content: {
    paddingTop: '10%',
  },
})