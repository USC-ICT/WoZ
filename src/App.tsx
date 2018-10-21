import * as React from "react";
// import logo from "./logo.svg";
import "./App.css";
import {WozCollection} from "./views/WozCollection";

export class App extends React.Component<{}, {}> {
  public render() {
    // noinspection SpellCheckingInspection
    return (
      <div className="App">
         <WozCollection spreadsheetID={"1zaCUTsvAsGJv-XcG1bXeKzKPsjsh7u2NbhmZV24uM8I"}/>
      </div>
    );
  }
}
