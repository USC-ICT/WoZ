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
import {SyntheticEvent} from "react"
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
  LOADING_GOOGLE = "GOOGLE",
  LOADING_EXCEL = "EXCEL",
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
  state: ConfigurationEditorState
  connector: IWozConnector
  error?: Error
}

export class ConfigurationEditor
    extends React.Component<IConfigurationEditorProperties, IConfigurationEditorState> {

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
      state: ConfigurationEditorState.NONE,
    }
  }

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

    return <Grid
        columns={1} centered
        verticalAlign="top">
      <Grid.Row>
        <Header>
          Select Connector<br/>
          <span style={{fontWeight: "normal"}}>
                      How the button event will be
                      dispatched
                      </span>
        </Header>
      </Grid.Row>
      <Grid.Row style={{paddingTop: "0"}}>
        <Select
            options={connectors}
            onChange={(
                _event: SyntheticEvent<HTMLElement>,
                data: DropdownProps) => {
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
      <Grid.Row>
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
        <Grid
            centered
            verticalAlign="middle">
          <Grid.Row>
            <Header>
              Select a recent WoZ spreadsheet
            </Header>
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
                    this._selectDataSourceWithID(data.value as string)
                  }}/>
            </Menu>
          </Grid.Row>

          <Divider horizontal>Or</Divider>

          <Grid.Row>
            <Header>
              Enter a new WoZ spreadsheet URL
            </Header>
          </Grid.Row>
          <Grid.Row style={{paddingTop: "0"}}>
            <Input
                disabled={this.state.state !== ConfigurationEditorState.NONE}
                loading={this.state.state
                         === ConfigurationEditorState.LOADING_GOOGLE}
                style={{width: "90%"}} fluid
                placeholder={"Google spreadsheet URL"}
                onChange={(_e, data) => {
                  this.setState({error: undefined})
                  this.coalescer.append(
                      () => {
                        this._loadSpreadsheetWithURL(data.value as string)
                      },
                      500)
                }}/>
          </Grid.Row>
          {errorMessage}
          <Divider horizontal>Or</Divider>
          <Grid.Row>
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
                           === ConfigurationEditorState.LOADING_EXCEL}
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

  private _extractSpreadsheetID = (url: string): string => {
    return url.trim().split("/")
              .reduce((previousValue, currentValue) => {
                return previousValue.length > currentValue.trim().length
                       ? previousValue : currentValue.trim()
              }, "")
  }

  private _loadSpreadsheetWithURL = (url: string) => {
    const spreadsheetID = this._extractSpreadsheetID(url)

    if (spreadsheetID === "") {
      this.setState({error: undefined})
      return
    }

    const dataSource = new GoogleSheetWozDataSource({spreadsheetID})

    if (dataSource.isEqual(this.props.dataSource)) {
      this._selectSpreadsheet(dataSource)
      return
    }

    this.setState({
      error: undefined,
      state: ConfigurationEditorState.LOADING_GOOGLE,
    })
    this._loadFromDataSource(dataSource)
  }

  private _loadLocalSpreadsheet = (files: FileList | null) => {
    if (files === null || files === undefined || files.length === 0) {
      return
    }

    const dataSource = new ExcelFileDataSource(files[0])

    this.setState({
      error: undefined,
      state: ConfigurationEditorState.LOADING_EXCEL,
    })
    this._loadFromDataSource(dataSource)
  }

  private _loadFromDataSource = (dataSource: IWozDataSource) => {
    dataSource
        .loadWozCollection({generateTabs: this.state.generateScreenNavigation})
        .then((data) => {
          const currentWoz = Object.values(data.wozs)[0]
          if (currentWoz === undefined) {
            throw new Error("No Wozs in the Woz collection.")
          }
          this.setState({state: ConfigurationEditorState.NONE})
          this._selectNewSpreadsheet(dataSource, data, currentWoz)
        })
        .catch((error) => {
          this.setState({error, state: ConfigurationEditorState.NONE})
        })
  }

  public render = () => {

    const year = (firstYear: number) => {
      const now = new Date()
      const currentYear = now.getFullYear()
      return currentYear === firstYear
             ? firstYear.toString()
             : (firstYear.toString() + "-" + currentYear.toString())
    }

    const version = () => {
      return appMetadata.major + "." + appMetadata.minor
             + " (" + appMetadata.build + ")"
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
                <Header as="h2" textAlign="center">
                  <Icon name={"cog"}/> Configure WoZ
                </Header>
                <Segment placeholder>
                  <Segment secondary className={css.connectorEditorSegment}
                           id={css.connectorEditorSegment}>
                    {this._connectorEditor()}
                  </Segment>
                  <Segment secondary textAlign="center">
                    <Checkbox
                        checked={this.state.generateScreenNavigation}
                        onChange={(_e, data) => {
                          const checked = data.checked || false
                          Store.shared.generateScreenNavigation = checked
                          this.setState({generateScreenNavigation: checked})
                        }}
                        label="Auto-generate screen navigation tabs"/>
                  </Segment>
                  <Segment secondary>
                    {this._providerEditor()}
                  </Segment>
                </Segment>
              </Grid.Column>
            </Grid>
          </div>
          <div className={css.configEditorCopyright}>
            <div className={css.documentationLink}>
              <a href={docPath}>WoZ Sheet Content Documentation</a>
            </div>
            WoZ {version()}.
            Copyright © {year(2018)}. USC/ICT. All rights reserved.
          </div>
        </div>
    )
  }
}
