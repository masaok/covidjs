import React from 'react';
// import logo from './logo.svg';
import './App.css';

import Demo from './pages/Demo'

import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <Router>
        {/* <div className={classes.root}> */}
        <div>
          <Switch>
            <Route exact path="/" component={Demo} />
            <Route exact path="/coronavirus/:state" component={Demo} />
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
