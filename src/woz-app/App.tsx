import * as React from "react";
import {log} from "../common/Logger";
// import logo from "./logo.svg";
import "./App.css";
import {ConfigurationEditor} from "./ConfigurationEditor";
import {WozConnectors} from "./connector/Connector";
import {Store} from "./Store";
import {IWozCollectionState, WozCollection} from "./WozCollection";

enum Components {
  CONFIG,
  WOZ,
}

interface IAppState {
  state: Components;
  wozState: IWozCollectionState;
}

export default class App extends React.Component<{}, IAppState> {

  constructor(props: any) {
    super(props);
    this.state = {
      state: Components.CONFIG,
      wozState: {
        connector: WozConnectors.shared.selectedConnector,
        spreadsheetID: Store.shared.selectedSpreadsheetID,
      },
    };
    // localStorage.clear();
  }

  public render() {
    if (window.localStorage === undefined) {
      log.error("local storage is not supported");
    }
    // log.debug("local storage is supported: ", window.localStorage);

    const content = (this.state.state === Components.CONFIG)
        ? (<ConfigurationEditor
            state={this.state.wozState}
            displayWoz={this.displayWoz}/>)
        : (<WozCollection
            displayConfig={this.displayConfig}
            state={this.state.wozState}/>);

    return (
        <div className="App">
          {content}
        </div>
    );
  }

  private displayConfig = (state: IWozCollectionState) => {
    this.setState(() => {
      return {
        state: Components.CONFIG,
        wozState: state,
      };
    });
  }

  private displayWoz = (state: IWozCollectionState) => {
    this.setState(() => {
      return {
        state: Components.WOZ,
        wozState: state,
      };
    });
  }
}
