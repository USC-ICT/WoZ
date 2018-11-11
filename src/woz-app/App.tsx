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
import {IWozDataSource} from "../woz/model/Model"
import {
  collectionLoading,
  WozCollection,
  WozCollectionState,
} from "../woz/views/WozCollection"
// import logo from "./logo.svg";
import css from "./App.module.css"
import {
  ConfigurationEditor,
  IConfigurationEditorCallback,
} from "./ConfigurationEditor"
import {WozConnectors} from "./connector/Connector"
import {DataSources} from "./DataSource"
import {Store} from "./Store"

type WOZ = "woz"
const WOZ: WOZ = "woz"
type CONFIG = "config"
const CONFIG: CONFIG = "config"

type AppState =
    {
      dataSource?: IWozDataSource,
      kind: CONFIG,
      wozState?: WozCollectionState,
    }
    |
    {
      dataSource: IWozDataSource,
      kind: WOZ,
      wozState: WozCollectionState,
    }

export default class App extends React.Component<{}, AppState> {

  constructor(props: any) {
    super(props)
    // localStorage.clear()

    const dataSource = DataSources.shared.selectedDataSource
    if (dataSource !== undefined) {
      this.state = {
        dataSource,
        kind: WOZ,
        wozState: collectionLoading(
            {
              dataSource,
              options: {
                generateTabs: Store.shared.generateScreenNavigation,
              },
            }),
      }
    } else {
      this.state = {kind: CONFIG}
    }
  }

  private displayConfig = (wozState: WozCollectionState) => {
    this.setState((prev) => {
      return {
        dataSource: prev.dataSource,
        kind: CONFIG,
        wozState,
      }
    })
  }

  private displayWoz = (callback: IConfigurationEditorCallback) => {
    this.setState({
      dataSource: callback.dataSource,
      kind: WOZ,
      wozState: callback.wozState,
    })
  }

  public render() {
    if (window.localStorage === undefined) {
      log.error("local storage is not supported")
    }
    // log.debug("local storage is supported: ", window.localStorage);

    let content: any = null

    switch (this.state.kind) {
      case CONFIG:
        content = <ConfigurationEditor
            dataSource={this.state.dataSource}
            wozState={this.state.wozState}
            onCommit={this.displayWoz}/>
        break
      case WOZ:
        content = <WozCollection
            onBack={this.displayConfig}
            initialState={this.state.wozState}
            resultCount={8}
            onButtonClick={WozConnectors.shared.selectedConnector.onButtonClick}
        />
        break
    }

    return (
        <div className={css.App}>
          {content}
        </div>
    )
  }
}
