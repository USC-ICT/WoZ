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
import {ReactNode, SyntheticEvent} from "react"
import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  DropdownProps,
  Grid,
  Header,
  Icon,
  Input,
  Menu,
  Message,
  Segment,
  Select,
} from "semantic-ui-react"
import {Coalescer} from "../common/Coalescer"
import {arrayMap} from "../common/util"
import appMetadata from "../metadata.json"
import {IWozCollectionModel, IWozDataSource} from "../woz/model/Model"
import {WozModel} from "../woz/model/WozModel"
import {ExcelFileDataSource} from "../woz/provider/excel/ExcelFileDataSource"
import {ExcelURLDataSource} from "../woz/provider/excel/ExcelURLDataSource"
import {GoogleSheetWozDataSource} from "../woz/provider/google/GoogleSheetWozDataSource"
import {
  collectionLoading,
  WozCollectionState,
  wozLoading,
} from "../woz/views/WozCollection"
import css from "./App.module.css"
import {IWozConnector, WozConnectors} from "./connector/Connector"
import {DataSources} from "./DataSource"
import {Store} from "./Store"

enum ConfigurationEditorState {
  NONE = "NONE",
  LOADING_URL = "GOOGLE",
  LOADING_FILE = "EXCEL",
}

export interface IConfigurationEditorCallback {
  dataSource: IWozDataSource
  wozState: WozCollectionState
  connector: IWozConnector
}

export interface IConfigurationEditorProperties {
  dataSource?: IWozDataSource
  onCommit: (callback: IConfigurationEditorCallback) => void
  wozState?: WozCollectionState
}

interface IConfigurationEditorState {
  dataSources: { [id: string]: IWozDataSource }
  generateScreenNavigation: boolean
  showChatTranscript: boolean
  state: ConfigurationEditorState
  connector: IWozConnector
  error?: Error
}

const _extractSpreadsheetID = (url: string): string => {
  return url.trim().split("/")
            .reduce((previousValue, currentValue) => {
              return previousValue.length > currentValue.trim().length
                     ? previousValue : currentValue.trim()
            }, "")
}

export const dataSourceForURL = (url: string): IWozDataSource | undefined => {
  const lowercasedURL = url.toLowerCase()

  // noinspection SpellCheckingInspection
  if (lowercasedURL.endsWith(".xlsx") || lowercasedURL.endsWith(".xls")) {
    return new ExcelURLDataSource({url})
  }

  const spreadsheetID = _extractSpreadsheetID(url)
  if (spreadsheetID === "") {
    return undefined
  }

  return new GoogleSheetWozDataSource({spreadsheetID})
}

export class ConfigurationEditor
    extends React.Component<IConfigurationEditorProperties, IConfigurationEditorState> {

  private readonly coalescer = new Coalescer()

  private _connectorEditor = () => {
    const connectors = arrayMap(WozConnectors.shared.all, (c) => {
      return {key: c.id, value: c.id, text: c.title}
    })

    // const connectorWithID = (id: string): any => {
    //   const c = WozConnectors.shared.all.find((x) => x.id === id);
    //   if (c === undefined) {
    //     return null;
    //   }
    //   return c;
    // };

    // const connectorComponent =
    // connectorWithID(this.state.connector.id).component();

    const connectorComponent = arrayMap(WozConnectors.shared.all, (c) => {
      return (
          <div
              key={c.id}
              className={css.connectorEditorTab}
              style={{
                visibility: c.id === this.state.connector.id ? "visible"
                                                             : "hidden",
              }}>{c.component()}</div>
      )
    })

    return <Grid  style={{paddingLeft: "1rem"}}
        columns={1}
        verticalAlign="top">
      <Grid.Row>
        <Header>
          Select a Connector
        </Header>
      </Grid.Row>
      <Grid.Row style={{paddingTop: "0"}}>
        <p className={css.explanation}>
          A connector defines how the WoZ events will be dispatched.
        </p>
      </Grid.Row>
      <Grid.Row style={{paddingTop: "0"}}>
        <Select
            options={connectors}
            onChange={(
                _event: SyntheticEvent<HTMLElement>,
                data: DropdownProps) => {
              // noinspection TypeScriptValidateTypes
              this.setState(() => {
                WozConnectors.shared.selectedConnectorID = data.value as string
                const connector = WozConnectors.shared.selectedConnector
                return {
                  connector,
                  error: undefined,
                }
              })
            }}
            value={this.state.connector.id}
        />
      </Grid.Row>
      <Grid.Row style={{paddingTop: "0"}}>
        {connectorComponent}
      </Grid.Row>

    </Grid>
  }

  private _providerEditor = () => {

    const orderedDataSources = arrayMap(Object.values(this.state.dataSources),
        (s) => ({
          key: s.id,
          text: s.title,
          value: s.id,
        }))

    const _compareDates = (a: Date, b: Date) => {
      return a > b ? -1 : a < b ? 1 : 0
    }

    orderedDataSources.sort(((a, b) =>
        _compareDates(
            this.state.dataSources[a.value].lastAccess,
            this.state.dataSources[b.value].lastAccess)))

    const errorMessage = (this.state.error === undefined)
                         ? null
                         : (
                             <Grid.Row>
                               <Message negative style={{width: "90%"}}>
                                 <p>{this.state.error.message.trim() !== ""
                                     ? this.state.error.message
                                     : "Unknown error"}</p>
                               </Message>
                             </Grid.Row>
                         )

    return (
        <Grid  style={{paddingLeft: "1rem"}}
            verticalAlign="middle">
          <Grid.Row>
            <Header>
              Select the WoZ data spreadsheet
            </Header>
          </Grid.Row>
          <Grid.Row style={{paddingTop: "0"}}>
            Select a recent WoZ spreadsheet
          </Grid.Row>
          <Grid.Row style={{paddingTop: "0"}}>
            <Menu>
              <Dropdown
                  options={orderedDataSources}
                  text={"Recent WoZ Spreadsheets"}
                  button item
                  selectOnBlur={false}
                  selectOnNavigation={false}
                  disabled={this.state.state !== ConfigurationEditorState.NONE
                            || orderedDataSources.length === 0}
                  onChange={(_e, data) => {
                    this._selectDataSourceWithID((data.value as string).trim())
                  }}/>
            </Menu>
          </Grid.Row>

          <Divider horizontal>Or</Divider>

          <Grid.Row style={{paddingTop: "0"}}>
            Enter a new WoZ spreadsheet URL
          </Grid.Row>
          <Grid.Row style={{paddingTop: "0"}}>
            <Input
                disabled={this.state.state !== ConfigurationEditorState.NONE}
                loading={this.state.state
                         === ConfigurationEditorState.LOADING_URL}
                style={{width: "90%"}} fluid
                placeholder={"Spreadsheet URL (Google or Excel format)"}
                onChange={(_e, data) => {
                  // noinspection TypeScriptValidateTypes
                  this.setState({error: undefined})
                  this.coalescer.append(
                      () => {
                        this._loadSpreadsheetWithURL(data.value.trim())
                      },
                      500)
                }}/>
          </Grid.Row>
          {errorMessage}
          <Divider horizontal>Or</Divider>
          <Grid.Row style={{paddingTop: "0"}}>
            <Input
                style={{width: "90%"}} fluid>
              <input
                  type="file"
                  id="excel"
                  // hide the input control
                  style={{display: "none"}}
                  onChange={(e) => {
                    this._loadLocalSpreadsheet(e.currentTarget.files)
                  }}/>
              <Button
                  disabled={this.state.state !== ConfigurationEditorState.NONE}
                  loading={this.state.state
                           === ConfigurationEditorState.LOADING_FILE}
                  as="label"
                  htmlFor="excel"
                  primary
                  // this and the Input style stretch the button
                  style={{maxWidth: "90%", lineHeight: "normal"}}
                  size="medium"
              ><Icon name="upload"/>Upload Excel spreadsheet</Button>
            </Input>
          </Grid.Row>
        </Grid>
    )
  }

  private _selectDataSourceWithID = (id: string) => {
    const dataSource = this.state.dataSources[id]
    if (dataSource === undefined) {
      return
    }
    this._selectSpreadsheet(dataSource)
  }

  private _selectNewSpreadsheet = (
      dataSource: IWozDataSource,
      wozCollection: IWozCollectionModel,
      currentWoz: WozModel) => {

    this.props.onCommit({
      connector: this.state.connector,
      dataSource,
      wozState: wozLoading({currentWoz, wozCollection}),
    })
  }

  private _selectSpreadsheet = (
      dataSource: IWozDataSource) => {

    DataSources.shared.selectedDataSource = dataSource

    if (dataSource.isEqual(this.props.dataSource)
        && this.props.wozState !== undefined) {
      this.props.onCommit({
        connector: this.state.connector,
        dataSource,
        wozState: this.props.wozState,
      })
      return
    }

    this.props.onCommit({
      connector: this.state.connector,
      dataSource,
      wozState: collectionLoading({
        dataSource,
        options: {
          generateTabs: this.state.generateScreenNavigation,
        },
      }),
    })
  }

  private _loadSpreadsheetWithURL = (url: string) => {
    const dataSource = dataSourceForURL(url)

    if (dataSource === undefined) {
      // noinspection TypeScriptValidateTypes
      this.setState({error: undefined})
      return
    }

    if (dataSource.isEqual(this.props.dataSource)) {
      this._selectSpreadsheet(dataSource)
      return
    }

    // noinspection TypeScriptValidateTypes
    this.setState({
      error: undefined,
      state: ConfigurationEditorState.LOADING_URL,
    })
    this._loadFromDataSource(dataSource)
  }

  private _loadLocalSpreadsheet = (files: FileList | null) => {
    if (files === null || files === undefined || files.length === 0) {
      return
    }

    const dataSource = new ExcelFileDataSource(files[0])

    // noinspection TypeScriptValidateTypes
    this.setState({
      error: undefined,
      state: ConfigurationEditorState.LOADING_FILE,
    })
    this._loadFromDataSource(dataSource)
  }

  private _loadFromDataSource = (dataSource: IWozDataSource) => {
    dataSource
        .loadWozCollection({generateTabs: this.state.generateScreenNavigation})
        .then((data) => {
          if (dataSource.shouldPersist) {
            const stored = Store.shared.knownSpreadsheets
            stored[dataSource.id] = {title: data.title, lastAccess: new Date()}
            Store.shared.knownSpreadsheets = stored
          }
          return data
        })
        .then((data) => {
          const currentWoz = Object.values(data.wozs)[0]
          if (currentWoz === undefined) {
            throw new Error("No Wozs in the Woz collection.")
          }
          // noinspection TypeScriptValidateTypes
          this.setState({state: ConfigurationEditorState.NONE})
          this._selectNewSpreadsheet(dataSource, data, currentWoz)
        })
        .catch((error?: Error) => {
          // noinspection TypeScriptValidateTypes
          this.setState({error, state: ConfigurationEditorState.NONE})
        })
  }

  constructor(props: IConfigurationEditorProperties) {
    super(props)

    let dataSources = DataSources.shared.recentDataSources
    if (props.dataSource !== undefined) {
      dataSources = {
        ...dataSources,
        ...{[props.dataSource.id]: props.dataSource},
      }
    }

    this.state = {
      connector: WozConnectors.shared.selectedConnector,
      dataSources,
      generateScreenNavigation: Store.shared.generateScreenNavigation,
      showChatTranscript: Store.shared.showChatTranscript,
      state: ConfigurationEditorState.NONE,
    }
  }

  public render = (): ReactNode => {

    const year = (firstYear: number) => {
      const now = new Date()
      const currentYear = now.getFullYear()
      return currentYear === firstYear
             ? firstYear.toString()
             : (firstYear.toString() + "-" + currentYear.toString())
    }

    const version = () => {
      return appMetadata.major.toString() + "." + appMetadata.minor.toString()
             + " (" + appMetadata.build.toString() + ")"
    }

    const docPath = "./doc"

    return (
        <div className={css.configEditor}>
          <div className={css.configEditorContainer}>
            <Grid centered
                // need this to center the panel on the page
                  style={{margin: "auto"}}
                  verticalAlign="middle">
              <Grid.Column style={{maxWidth: 650}}>
                <Header as="h2">
                  <Icon name={"cog"}/> Configure WoZ
                </Header>
                <Segment secondary className={css.connectorEditorSegment}
                         id={css.connectorEditorSegment}>
                  {this._connectorEditor()}
                </Segment>
                <Segment secondary>
                  <Checkbox
                      checked={this.state.generateScreenNavigation}
                      onChange={(_e, data) => {
                        const checked = data.checked || false
                        Store.shared.generateScreenNavigation = checked
                        // noinspection TypeScriptValidateTypes
                        this.setState({generateScreenNavigation: checked})
                      }}
                      label="Auto-generate screen navigation tabs"/>
                  <p className={css.explanation}>If enabled,
                    we will parse the WoZ excel file and generate
                    screen navigation buttons automatically. (Please see
                    the <a href={docPath}>WoZ spreadsheet format manual</a> for
                    details.)
                    We assume that each
                    screen needs a button, the buttons should be placed in the
                    top row on each screen, and all the screen buttons are
                    available on each screen. If you need a more involved
                    navigation, for example, some screens are only accessible
                    from a subset of screens, then you need to define that
                    in your WoZ spreadsheet and uncheck this box when loading
                    the file.</p>
                </Segment>
                <Segment secondary>
                  <Checkbox
                      checked={this.state.showChatTranscript}
                      onChange={(_e, data) => {
                        const checked = data.checked || false
                        Store.shared.showChatTranscript = checked
                        // noinspection TypeScriptValidateTypes
                        this.setState({showChatTranscript: checked})
                      }}
                      label="Show chat transcript"/>
                  <p className={css.explanation}>If enabled,
                    we will display the conversation transcript
                    next to the rest of the interface. </p>
                </Segment>
                <Segment secondary>
                  {this._providerEditor()}
                </Segment>
                <Segment secondary>
                  <a href={docPath}>WoZ Sheet Content Documentation</a>
                </Segment>
              </Grid.Column>
            </Grid>
          </div>
          <div className={css.configEditorCopyright}>
            WoZ {version()}.
            Copyright © {year(2018)}. USC/ICT. All rights reserved.
          </div>
        </div>
    )
  }
}
