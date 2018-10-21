import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import GoogleSheetController from './views/GoogleSheetController';

class App extends Component {
  render() {
    return (
      <div className="App">
         <GoogleSheetController/>
      </div>
    );
  }
}

export default App;
