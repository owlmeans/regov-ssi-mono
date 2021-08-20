import ReactDOM from 'react-dom'
import { ThemeProvider, CssBaseline } from '@material-ui/core'

import { theme } from './theme'
import { App } from './app'


ReactDOM.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.querySelector('#root')
)