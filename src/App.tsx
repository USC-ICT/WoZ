import * as React from 'react';
// import logo from './logo.svg';
import './App.css';
import * as GoogleSheetController from './views/GoogleSheetController';

class App extends React.Component<{},{}> {
  render() {
    return (
      <div className="App">
         <GoogleSheetController.GoogleSheetController/>
      </div>
    );
  }
}

export default App;
