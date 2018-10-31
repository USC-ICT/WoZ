import * as React from "react";
import {SyntheticEvent} from "react";
import {
  Button,
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
} from "semantic-ui-react";
import {Coalescer} from "../common/Coalescer";
import {log} from "../common/Logger";
import {arrayMap} from "../common/util";
import {IWozCollectionModel, IWozDataSource} from "../woz/model/Model";
import {IWozCollectionState} from "../woz/views/WozCollection";
import {IWozConnector, WozConnectors} from "./connector/Connector";
import {DataSources} from "./provider/DataSource";
import {ExcelWozDataSource} from "./provider/excel/ExcelWozDataSource";
import {GoogleSheetWozDataSource} from "./provider/google/GoogleSheetWozDataSource";

enum ConfigurationEditorState {
  NONE = "NONE",
  LOADING_GOOGLE = "GOOGLE",
  LOADING_EXCEL = "EXCEL",
}

interface IConfigurationEditorProperties {
  connector: IWozConnector;
  displayWoz: (state: IWozCollectionState) => void;
  state: IWozCollectionState;
}

interface IConfigurationEditorState {
  dataSources: { [id: string]: IWozDataSource };
  state: ConfigurationEditorState;
  connector: IWozConnector;
  error?: Error;
  wozUIState: IWozCollectionState;
}

export class ConfigurationEditor
    extends React.Component<IConfigurationEditorProperties, IConfigurationEditorState> {

  private readonly coalescer = new Coalescer();

  constructor(props: IConfigurationEditorProperties) {
    super(props);

    this.state = {
      connector: props.connector,
      dataSources: DataSources.shared.recentDataSources,
      state: ConfigurationEditorState.NONE,
      wozUIState: props.state,
    };
  }

  public render() {

    // log.debug("connectors", connectors);
    // log.debug("select", this.state.wozUIState.connector.id);

    const subSegmentStyle = {backgroundColor: "#f0f0f0"};

    // const uploadIcon = (<Icon name={"upload"}/>);

    return (
        <Grid centered style={{height: "100%"}}
              verticalAlign="middle">
          <Grid.Column style={{maxWidth: 650}}>
            <Header as="h2" textAlign="center">
              <Icon name={"cog"}/> Configure WoZ
            </Header>
            <Segment placeholder>
              <Segment style={subSegmentStyle}>
                {this._connectorEditor()}
              </Segment>
              <Segment style={subSegmentStyle}>
                {this._providerEditor()}
              </Segment>
            </Segment>
          </Grid.Column>
        </Grid>
    );
  }

  private _connectorEditor = () => {
    const connectors = arrayMap(WozConnectors.shared.all, (c) => {
      return {key: c.id, value: c.id, text: c.title};
    });

    const connectorWithID = (id: string): any => {
      const c = WozConnectors.shared.all.find((x) => x.id === id);
      if (c === undefined) {
        return null;
      }
      return c;
    };

    return <Grid
        columns={1} centered
        style={{height: "100%"}}
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
      <Grid.Row>
        <Select
            options={connectors}
            onChange={(
                _event: SyntheticEvent<HTMLElement>,
                data: DropdownProps) => {
              this.setState(() => {
                WozConnectors.shared.selectedConnectorID = data.value as string;
                const connector = WozConnectors.shared.selectedConnector;
                return {
                  connector,
                  error: undefined,
                };
              });
            }}
            value={this.state.connector.id}
            style={{maxWidth: 300}}/>
      </Grid.Row>
      <Grid.Row>
        {connectorWithID(this.state.connector.id).component()}
      </Grid.Row>

    </Grid>;
  }

  private _providerEditor = () => {

    const orderedDataSources = arrayMap(Object.values(this.state.dataSources),
        (s) => ({key: s.id, text: s.title, value: s.id}));
    orderedDataSources.sort(((a, b) => a.text.localeCompare(b.text)));

    const errorMessage = (this.state.error === undefined)
        ? null
        : (
            <Grid.Row>
              <Message negative style={{width: "90%"}}>
                <p>{this.state.error.message}</p>
              </Message>
            </Grid.Row>
        );

    return (
        <Grid
            centered
            style={{height: "100%"}}
            verticalAlign="middle">
          <Grid.Row>
            <Header>
              Select a recent WoZ spreadsheet
            </Header>
          </Grid.Row>
          <Grid.Row>
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
                    this._selectDataSourceWithID(data.value as string);
                  }}/>
            </Menu>
          </Grid.Row>

          <Divider horizontal>Or</Divider>

          <Grid.Row>
            <Header>
              Enter a new WoZ spreadsheet URL
            </Header>
          </Grid.Row>
          <Grid.Row>
            <Input
                disabled={this.state.state !== ConfigurationEditorState.NONE}
                loading={this.state.state === ConfigurationEditorState.LOADING_GOOGLE}
                style={{width: "90%"}} fluid
                placeholder={"Google spreadsheet URL"}
                onChange={(_e, data) => {
                  this.setState({error: undefined});
                  this.coalescer.append(
                      () => {
                        this._loadSpreadsheetWithURL(data.value as string);
                      },
                      500);
                }}/>
          </Grid.Row>
          {errorMessage}
          <Divider horizontal>Or</Divider>
          <Grid.Row>
            <Input
                style={{width: "90%"}} fluid
            >
              <input
                  type="file"
                  id="excel"
                  style={{display: "none"}}
                  onChange={(e) => {
                    this._loadLocalSpreadsheet(e.currentTarget.files);
                  }}/>
              <Button
                  disabled={this.state.state !== ConfigurationEditorState.NONE}
                  loading={this.state.state === ConfigurationEditorState.LOADING_EXCEL}
                  as="label"
                  htmlFor="excel"
                  primary
                  style={{maxWidth: "90%", lineHeight: "normal"}}
                  size="medium"
              ><Icon name="upload"/>Upload Excel spreadsheet</Button>
            </Input>
          </Grid.Row>
        </Grid>
    );
  }

  private _selectDataSourceWithID = (id: string) => {
    log.debug(id);
    const dataSource = this.state.dataSources[id];
    if (dataSource === undefined) {
      return;
    }
    this._selectSpreadsheet(dataSource);
  }

  private _selectSpreadsheet = (
      dataSource: IWozDataSource, data?: IWozCollectionModel) => {
    this.setState((prev) => {
      DataSources.shared.selectedDataSource = dataSource;
      const wozUIState = (dataSource.isEqual(this.props.state.provider))
          ? {
            ...this.props.state,
            ...{onButtonClick: prev.connector.onButtonClick},
          } : {
            allWozs: data,
            onButtonClick: prev.connector.onButtonClick,
            provider: dataSource,
          };
      window.setTimeout(() => this.props.displayWoz(wozUIState), 10);
      return {
        error: undefined,
        wozUIState,
      };
    });
  }

  private _extractSpreadsheetID = (url: string): string => {
    return url.trim().split("/").reduce((previousValue, currentValue) => {
      return previousValue.length > currentValue.trim().length
          ? previousValue : currentValue.trim();
    }, "");
  }

  private _loadSpreadsheetWithURL = (url: string) => {
    const spreadsheetID = this._extractSpreadsheetID(url);

    if (spreadsheetID === "") {
      this.setState({error: undefined});
      return;
    }

    const dataSource = new GoogleSheetWozDataSource(spreadsheetID, "loading...");

    if (dataSource.isEqual(this.props.state.provider)) {
      this._selectSpreadsheet(dataSource);
      return;
    }

    this.setState({error: undefined, state: ConfigurationEditorState.LOADING_GOOGLE});
    this._loadFromDataSource(dataSource);
  }

  private _loadLocalSpreadsheet = (files: FileList | null) => {
    if (files === null || files === undefined || files.length === 0) {
      return;
    }

    log.debug(files[0]);

    const dataSource = new ExcelWozDataSource(files[0]);

    this.setState({error: undefined, state: ConfigurationEditorState.LOADING_EXCEL});
    this._loadFromDataSource(dataSource);
  }

  private _loadFromDataSource = (dataSource: IWozDataSource) => {
    dataSource
        .loadWozCollection()
        .then((data) => {
          this.setState({state: ConfigurationEditorState.NONE});
          this._selectSpreadsheet(dataSource, data);
        }, (error) => {
          this.setState({error, state: ConfigurationEditorState.NONE});
        });
  }
}
