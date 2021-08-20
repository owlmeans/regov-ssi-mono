
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom"

import { Box } from '@material-ui/core'

import { StoreNavigation } from "./store"
import { WalletNavigation } from "./wallet"

export const RootNavigation = () =>
  <Router>
    <Box>
      <Box>
        <Link to="/wallet">Wallet</Link>
      </Box>
      <Switch>
        <Route exact path="/">
          <div>... to redirect</div>
        </Route>
        <Route path="/store">
          <StoreNavigation />
        </Route>
        <Route path="/wallet">
          <WalletNavigation />
        </Route>
      </Switch>
    </Box>
  </Router>