import * as React from "react";
// import logo from "./logo.svg";
import "./App.css";
import {GoogleSheetController} from "./views/GoogleSheetController";

export class App extends React.Component<{}, {}> {
  public render() {
    return (
      <div className="App">
         <GoogleSheetController/>
      </div>
    );
  }
}
