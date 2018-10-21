import * as React from 'react';
// import logo from './logo.svg';
import './App.css';
import * as GoogleSheetController from './views/GoogleSheetController';
class App extends React.Component {
    render() {
        return (React.createElement("div", { className: "App" },
            React.createElement(GoogleSheetController.GoogleSheetController, null)));
    }
}
export default App;
//# sourceMappingURL=App.js.map