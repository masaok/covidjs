import React from 'react';
import './App.css';

import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'

// https://material-ui.com/styles/advanced/#theming
import { ThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

import Demo from './pages/Demo'
import DailyUS from './pages/DailyUS'

// https://material-ui.com/customization/theming/#api
let theme = createMuiTheme();
theme = responsiveFontSizes(theme);

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Router>
          {/* <div className={classes.root}> */}
          <div>
            <Switch>
              <Route exact path="/" component={Demo} />
              <Route exact path="/us/daily" component={DailyUS} />
              <Route exact path="/coronavirus/:state" component={Demo} />
            </Switch>
          </div>
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
