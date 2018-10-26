import * as React from "react";
// import logo from "./logo.svg";
import "./App.css";
import {ConfigurationEditor} from "./configuration/views/ConfigurationEditor";
import {log} from "./controller/Logger";
import {Store} from "./model/Store";
import {IWozCollectionState, WozCollection} from "./views/WozCollection";

enum Components {
  CONFIG,
  WOZ,
}

interface IAppState {
  state: Components;
  wozState: IWozCollectionState;
}

export class App extends React.Component<{}, IAppState> {

  constructor(props: any) {
    super(props);
    this.state = {
      state: Components.CONFIG,
      wozState: {
        spreadsheetID: Store.shared.selectedSpreadsheetID,
      },
    };
    // localStorage.clear();
  }

  public render() {
    log.debug("local storage supported: ", window.localStorage);

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
