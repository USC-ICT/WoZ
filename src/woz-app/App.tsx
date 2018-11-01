import * as React from "react"
import {log} from "../common/Logger"
import {IWozCollectionState, WozCollection} from "../woz/views/WozCollection"
// import logo from "./logo.svg";
import css from "./App.module.css"
import {ConfigurationEditor} from "./ConfigurationEditor"
import {WozConnectors} from "./connector/Connector"
import {DataSources} from "./provider/DataSource"

enum Components {
  CONFIG,
  WOZ,
}

interface IAppState {
  state: Components
  wozState: IWozCollectionState
}

export default class App extends React.Component<{}, IAppState> {

  constructor(props: any) {
    super(props)
    // localStorage.clear()
    this.state = {
      state: Components.CONFIG,
      wozState: {
        dataSource: DataSources.shared.selectedDataSource,
        onButtonClick: WozConnectors.shared.selectedConnector.onButtonClick,
      },
    }
  }

  public render() {
    if (window.localStorage === undefined) {
      log.error("local storage is not supported")
    }
    // log.debug("local storage is supported: ", window.localStorage);

    const content = (this.state.state === Components.CONFIG)
        ? (<ConfigurationEditor
            connector={WozConnectors.shared.selectedConnector}
            state={this.state.wozState}
            displayWoz={this.displayWoz}/>)
        : (<WozCollection
            displayConfig={this.displayConfig}
            state={this.state.wozState}/>)

    return (
        <div className={css.App}>
          {content}
        </div>
    )
  }

  private displayConfig = (state: IWozCollectionState) => {
    this.setState(() => {
      return {
        state: Components.CONFIG,
        wozState: state,
      }
    })
  }

  private displayWoz = (state: IWozCollectionState) => {
    this.setState(() => {
      return {
        state: Components.WOZ,
        wozState: state,
      }
    })
  }
}
