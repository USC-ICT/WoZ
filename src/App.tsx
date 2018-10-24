import * as React from "react";
// import logo from "./logo.svg";
import "./App.css";
import {log} from "./controller/Logger";
import {Store} from "./model/Store";
import {WozCollection} from "./views/WozCollection";

export class App extends React.Component<{}, {}> {

  constructor(props: any) {
    super(props);
    // localStorage.clear();
  }

  public render() {
    log.debug("local storage supported: ", window.localStorage);

    // noinspection SpellCheckingInspection
    return (
        <div className="App">
          <WozCollection
              spreadsheetID={Store.shared.selectedSpreadsheetID}/>
        </div>
    );
  }
}
