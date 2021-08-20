
import {
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom"

import { Box } from '@material-ui/core'

export const StoreNavigation = () => {
  let { path/*, url*/ } = useRouteMatch()

  return <Box>
    <Switch>
      <Route exact path={path}>
        <div>store list</div>
      </Route>
      <Route path={`${path}/create`}>
        <div>create store</div>
        <div>new / import</div>
      </Route>
      <Route path={`${path}/login/:store`}>
        <div>store login</div>
      </Route>
      <Route path={`${path}/info`}>
        <div>store info</div>
      </Route>
    </Switch>
  </Box>
}