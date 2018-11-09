/*
 * Copyright 2018. University of Southern California
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react"
import {log} from "../common/Logger"
import {IWozCollectionState, WozCollection} from "../woz/views/WozCollection"
// import logo from "./logo.svg";
import css from "./App.module.css"
import {ConfigurationEditor} from "./ConfigurationEditor"
import {WozConnectors} from "./connector/Connector"
import {DataSources} from "./DataSource"

enum Components {
  CONFIG,
  WOZ,
}

interface IAppState {
  state: Components
  wozState: IWozCollectionState
}

export default class App extends React.Component<{}, IAppState> {

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
}
