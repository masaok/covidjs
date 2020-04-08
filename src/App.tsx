import React from 'react'
import { Helmet } from 'react-helmet'
import CssBaseline from '@material-ui/core/CssBaseline'
import './App.css'

import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'

// https://material-ui.com/styles/advanced/#theming
import { ThemeProvider } from '@material-ui/core/styles'
import { makeStyles, createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'

import Header from './components/Header'
import Footer from './components/Footer'

import Demo from './pages/Demo'
import DailyUS from './pages/DailyUS'

// https://material-ui.com/customization/theming/#api
let theme = createMuiTheme({
  typography: {
    fontFamily: [
      'Roboto',
    ].join(',')
  }
})
theme = responsiveFontSizes(theme)

const useStyles = makeStyles(theme => ({
  root: {
    // overflowY: 'scroll'
  },
}))

const App = (props: object) => {
  const classes = useStyles(props)

  return (
    <div className={classes.root}>
      {/* Dynamic Header Info: https://github.com/nfl/react-helmet */}
      <Helmet>
        <title>COVIDjs - COVID-19 Tracking Charts</title>
        <meta name="description" content="COVID charts based on data from The COVID Tracking Project" />
      </Helmet>
      <ThemeProvider theme={theme}>
        {/* https://material-ui.com/components/css-baseline/ */}
        <CssBaseline />
        <Router>
          {/* <div className={classes.root}> */}
          <div>
            <Switch>
              <Route component={Header} />
            </Switch>
            <Switch>
              {/* <Route exact path="/" component={Demo} /> */}
              <Route exact path="/" component={DailyUS} />
              <Route exact path="/us/daily" component={DailyUS} />
              <Route exact path="/coronavirus/:state" component={Demo} />
            </Switch>
            <Switch>
              <Route component={Footer} />
            </Switch>
          </div>
        </Router>
      </ThemeProvider>
    </div>
  )
}

export default App
