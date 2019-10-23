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
import {objectMap} from "../common/util"
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
  dataSourceForURL,
  IConfigurationEditorCallback,
} from "./ConfigurationEditor"
import {WozConnectors} from "./connector/Connector"
import {DataSources} from "./DataSource"
import {Store} from "./Store"
import {WoZWithCharCollection} from "./WoZWithChatCollection"

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

// tslint:disable-next-line:interface-name
export interface StringMap {[index: string]: string}

export default class App extends React.Component<{}, AppState> {

  constructor(props: any) {
    super(props)
    this.state = {
      kind: CONFIG,
    }

    localStorage.clear()

    const params: StringMap = {}

    new URL(window.location.href)
        .searchParams.forEach((value, key) => {
      params[key] = value
    })

    const dataSource = DataSources.shared.selectedDataSource

    const dataSourceURL = params.url
    if (dataSourceURL !== undefined) {
      const urlDataSource = dataSourceForURL(dataSourceURL)
      if (urlDataSource !== undefined) {
        const connectorID = params.connector
        if (connectorID !== undefined) {
          const connector = WozConnectors
              .shared.all.find((value) => (value.id === connectorID))
          if (connector !== undefined) {
            Store.shared.generateScreenNavigation =
                (params.generateScreenNavigation || "true")
                    .toLowerCase() === "true"
            Store.shared.showChatTranscript =
                (params.showChatTranscript ||
                 (connectorID === "ADConnector" ? "true" : "false"))
                    .toLowerCase() === "true"
            WozConnectors.shared.selectedConnectorID = connectorID
            connector.connect(params)
                     .then((result) => {
                       // console.log(result)
                       if (result) {
                         this.setState(this._newState(urlDataSource))
                       }
                     }).catch((error: any) => {
              console.error(error)
            })
          }
        }
      }
    }

    this.state = this._newState(dataSource)
  }

  private _newState = (dataSource: IWozDataSource | undefined): AppState => {
    if (dataSource !== undefined) {
      return {
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
      return {
        kind: CONFIG,
      }
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

  private copyURL = (currentWoz: string) => {
    const props = {
      currentWoz,
      generateScreenNavigation: Store.shared.generateScreenNavigation,
      showChatTranscript: Store.shared.showChatTranscript,
      ...WozConnectors.shared.selectedConnector.props,
      ...(this.state.dataSource !== undefined) ? this.state.dataSource.props : {},
    }

    const query = objectMap(
        props, ([key, value]) => key + "=" + encodeURIComponent(value.toString()))
        .join("&")

    const url = window.location.href + "?" + query

    // console.log(url)

    const textArea = document.createElement("textarea")
    textArea.value = url
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      // const successful =
          document.execCommand("copy")
      // const msg = successful ? "successful" : "unsuccessful"
      // console.log("Fallback: Copying text command was " + msg)
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err)
    }

    document.body.removeChild(textArea)
  }

  private displayWoz = (callback: IConfigurationEditorCallback) => {
    this.setState({
      dataSource: callback.dataSource,
      kind: WOZ,
      wozState: callback.wozState,
    })
  }

  private handleError = () => {
    this.setState((prev) => {
      return {
        dataSource: prev.dataSource,
        kind: CONFIG,
        wozState: undefined,
      }
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
        if (Store.shared.showChatTranscript) {
          content = <WoZWithCharCollection
              onBack={this.displayConfig}
              onCopyURL={this.copyURL}
              initialState={this.state.wozState}
              resultCount={8}
              onButtonClick={WozConnectors.shared.selectedConnector.onButtonClick}
              onMount={WozConnectors.shared.selectedConnector.onUIAppear}
              onError={this.handleError}
          />
        } else {
          content = <WozCollection
              onBack={this.displayConfig}
              onCopyURL={this.copyURL}
              initialState={this.state.wozState}
              resultCount={8}
              onButtonClick={WozConnectors.shared.selectedConnector.onButtonClick}
              onMount={WozConnectors.shared.selectedConnector.onUIAppear}
              onError={this.handleError}
          />
        }
        break
    }

    return (
        <div className={css.App}>
          {content}
        </div>
    )
  }
}
