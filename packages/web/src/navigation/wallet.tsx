
import {
  Switch,
  Route,
  useRouteMatch,
  useHistory
} from "react-router-dom"

import { Button, Grid } from '@material-ui/core'
import {
  IssuerCredentialSigner,
  WalletCredentialImporter,
  WalletCredentialBundler,
  WalletPassport,
  CredentialClaim,
  CredentialVerifier
} from "../components"

export const WalletNavigation = () => {
  let { path } = useRouteMatch()
  const history = useHistory()

  return <Switch>
    <Route exact path={`${path}`}>
      <Grid container direction="row" justifyContent="space-between" alignItems="stretch"
        spacing={1}>
        <Grid container item xs={6} direction="column" justifyContent="flex-start" alignItems="stretch"
          spacing={1}>
          <Grid item>
            <CredentialClaim />
          </Grid>
        </Grid>
        <Grid container item xs={6} spacing={1}
          direction="column" justifyContent="flex-start" alignItems="stretch">
          <Grid item>
            <WalletPassport />
          </Grid>
          <Grid container item spacing={2}
            direction="column"
            justifyContent="flex-start"
            alignItems="stretch">
            <Grid item>
              <Button fullWidth variant="contained" color="secondary"
                onClick={() => history.push(`${path}/claim/sign`)}>Выписать документ по заявке</Button>
            </Grid>
            <Grid item>
              <Button fullWidth variant="contained" color="secondary"
                onClick={() => history.push(`${path}/import/peer`)}>Добавить доверенное лицо</Button>
            </Grid>
            <Grid item>
              <Button fullWidth variant="contained" color="secondary"
                onClick={() => history.push(`${path}/verify`)}>Проверить документ</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Route>
    <Route path={`${path}/export/:type/:credential`}>
      <WalletCredentialBundler />
    </Route>
    <Route path={`${path}/import/:section`}>
      <WalletCredentialImporter />
    </Route>
    <Route path={`${path}/claim/sign`}>
      <IssuerCredentialSigner />
    </Route>
    <Route path={`${path}/verify`}>
      <CredentialVerifier />
    </Route>
  </Switch>
}