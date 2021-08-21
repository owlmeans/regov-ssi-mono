
import {
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom"

//import { Box } from '@material-ui/core'
import { StoreCreation, StoreLogin } from "../components"


export const StoreNavigation = () => {
  let { path/*, url*/ } = useRouteMatch()

  return <Switch>
      <Route exact path={path}>
        <StoreCreation />
      </Route>
      <Route path={`${path}/create`}>
        <div>create store</div>
        <div>new / import</div>
      </Route>
      <Route path={`${path}/login/:store`}>
        <StoreLogin />
      </Route>
      <Route path={`${path}/info`}>
        <div>store info</div>
      </Route>
    </Switch>
}