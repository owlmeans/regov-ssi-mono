
import {
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom"

import { StoreCreation, StoreList, StoreLogin } from "../components"


export const StoreNavigation = () => {
  let { path } = useRouteMatch()

  return <Switch>
      <Route exact path={path}>
        <StoreList />
      </Route>
      <Route path={`${path}/create`}>
        <StoreCreation />
      </Route>
      <Route path={`${path}/login/:store`}>
        <StoreLogin />
      </Route>
      <Route path={`${path}/info`}>
        <div>store info</div>
      </Route>
    </Switch>
}