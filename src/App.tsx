import * as React from "react";
// import logo from "./logo.svg";
import "./App.css";
import {WozCollection} from "./views/WozCollection";

export class App extends React.Component<{}, {}> {
  public render() {
    return (
      <div className="App">
         <WozCollection/>
      </div>
    );
  }
}
