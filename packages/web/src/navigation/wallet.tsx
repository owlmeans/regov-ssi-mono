
import {
  Switch,
  Route,
  Link,
  useRouteMatch
} from "react-router-dom"

import { Grid, Paper, Typography } from '@material-ui/core'
import { WalletCredentialBundler, WalletPassport } from "../components"

export const WalletNavigation = () => {
  let { path, url } = useRouteMatch()

  return <Switch>
    <Route exact path={`${path}`}>
      <Grid container direction="row" justifyContent="space-between" alignItems="stretch"
        spacing={1}>
        <Grid container item xs={6} direction="column" justifyContent="flex-start" alignItems="stretch"
          spacing={1}>
          <Grid item>
            <Paper>
              <Typography>Hello</Typography>
            </Paper>
          </Grid>
          <Grid item>
            <Paper>
              <Typography>Hello</Typography>
            </Paper>
          </Grid>
        </Grid>
        <Grid container item xs={6} direction="column" justifyContent="flex-start" alignItems="stretch">
          <Grid item>
            <WalletPassport />
          </Grid>
        </Grid>
      </Grid>
    </Route>
    <Route path={`${path}/export/:type/:credential`}>
      <WalletCredentialBundler />
    </Route>
  </Switch>


  // return <Box>
  //   <div>wallet navigation</div>
  //   <Box>
  //     <Link to={`${url}/credentials/own`}>Own Credentials</Link>
  //     <Link to={`${url}/identity/provide`}>Provide Identity</Link>
  //   </Box>
  //   <Switch>
  //     <Route exact path={path}>
  //       <div>wallet home</div>
  //     </Route>
  //     <Route path={`${path}/credentials/own`}>
  //       <div>own credentials</div>
  //     </Route>
  //     <Route path={`${path}/credentials/own/create`}>
  //       <div>create credential for myself</div>
  //     </Route>
  //     <Route path={`${path}/credentials/own/:id/sign`}>
  //       <div>sign own unsigned credential</div>
  //     </Route>
  //     <Route path={`${path}/credentials/own/:id`}>
  //       <div>view own credentials</div>
  //     </Route>
  //     <Route path={`${path}/credentials/own/:id/provide`}>
  //       <div>provide credential</div>
  //     </Route>
  //     <Route path={`${path}/credentials/own/provide`}>
  //       <div>provide credential by request</div>
  //     </Route>
  //     <Route path={`${path}/identity/provide`}>
  //       <div>provide identity</div>
  //     </Route>
  //     <Route path={`${path}/credentials/confirm`}>
  //       <div>confirm credentail with modified subject data</div>
  //     </Route>
  //     <Route path={`${path}/credentials/claim`}>
  //       <div>claim credentail by known schema</div>
  //     </Route>

  //     <Route path={`${path}/identity/request`}>
  //       <div>request identity</div>
  //     </Route>
  //     <Route path={`${path}/identity/verify`}>
  //       <div>verify identity</div>
  //     </Route>
  //     <Route path={`${path}/credentials/request`}>
  //       <div>request credentials with chalange</div>
  //     </Route>
  //     <Route path={`${path}/credentials/verify`}>
  //       <div>verify requested credentials</div>
  //     </Route>
  //     <Route path={`${path}/credentials/offer`}>
  //       <div>offer credential to identity</div>
  //     </Route>
  //     <Route path={`${path}/credentials/claimed/issue`}>
  //       <div>issue claimed credential</div>
  //     </Route>
  //     <Route path={`${path}/credentials/confirmed/issue`}>
  //       <div>issue confirmed credential</div>
  //     </Route>
  //   </Switch>
  // </Box>
}