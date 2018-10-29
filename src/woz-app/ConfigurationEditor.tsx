import * as React from "react";
import {SyntheticEvent} from "react";
import {
  Button,
  Divider,
  DropdownProps,
  Grid,
  Header,
  Icon,
  Input,
  Message,
  Segment,
  Select,
} from "semantic-ui-react";
import {Coalescer} from "../common/Coalescer";
import {arrayMap} from "../common/util";
import {IWozCollectionModel} from "../woz/model/Model";
import {WozConnectors} from "./connector/Connector";
import {GoogleSheetWozLoader} from "./GoogleSheetWozLoader";
import {GoogleSheetWozProvider} from "./GoogleSheetWozProvider";
import {Store} from "./Store";
import {IWozCollectionState} from "./WozCollection";

// interface IConfigurationEditorState {
//
// }

interface IConfigurationEditorProperties {
  state: IWozCollectionState;
  displayWoz: (state: IWozCollectionState) => void;
}

interface IConfigurationEditorState {
  error?: Error;
  checkingSheet: boolean;
  wozUIState: IWozCollectionState;
}

export class ConfigurationEditor
    extends React.Component<IConfigurationEditorProperties, IConfigurationEditorState> {

  private readonly coalescer = new Coalescer();

  constructor(props: IConfigurationEditorProperties) {
    super(props);

    this.state = {
      checkingSheet: false,
      wozUIState: props.state,
    };
  }

  public render() {

    const knownSheets = arrayMap(
        Object.entries(Store.shared.knownSpreadsheets),
        ([id, sheet]) => {
          return {key: id, value: id, text: sheet.title};
        });
    knownSheets.sort(((a, b) => a.text.localeCompare(b.text)));

    const connectors = arrayMap(WozConnectors.shared.all, (c) => {
      return {key: c.id, value: c.id, text: c.title};
    });

    // log.debug("connectors", connectors);
    // log.debug("select", this.state.wozUIState.connector.id);

    const connectorWithID = (id: string): any => {
      const c = WozConnectors.shared.all.find((x) => x.id === id);
      if (c === undefined) {
        return null;
      }
      return c;
    };

    const subSegmentStyle = {backgroundColor: "#f0f0f0"};

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
        <Grid centered style={{height: "100%"}}
              verticalAlign="middle">
          <Grid.Column style={{maxWidth: 650}}>
            <Header as="h2" textAlign="center">
              <Icon name={"cog"}/> Configure WoZ
            </Header>
            <Segment placeholder>
              <Segment style={subSegmentStyle}>
                <Grid
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
                          this.setState((prev) => {
                            WozConnectors.shared.selectedConnectorID = data.value as string;
                            return {
                              error: undefined,
                              wozUIState: {
                                ...prev.wozUIState,
                                ...{connector: WozConnectors.shared.selectedConnector},
                              },
                            };
                          });
                        }}
                        value={this.state.wozUIState.connector.id}
                        style={{maxWidth: 300}}/>
                  </Grid.Row>
                  <Grid.Row>
                    {connectorWithID(this.state.wozUIState.connector.id).component()}
                  </Grid.Row>

                </Grid>
              </Segment>

              <Segment style={subSegmentStyle}>
                <Grid
                    columns={1} centered
                    style={{height: "100%"}}
                    verticalAlign="middle">
                  <Grid.Row>
                    <Header>
                      Select a recent WoZ spreadsheet
                    </Header>
                  </Grid.Row>
                  <Grid.Row>
                    <Select
                        options={knownSheets}
                        value={Store.shared.selectedSpreadsheetID}
                        disabled={this.state.checkingSheet || knownSheets.length === 0}
                        onChange={(_e, data) => {
                          this._selectSpreadsheetWithID(data.value as string);
                        }}/>
                  </Grid.Row>

                  <Divider horizontal>Or</Divider>

                  <Grid.Row>
                    <Header>
                      Enter a new WoZ spreadsheet URL
                    </Header>
                  </Grid.Row>
                  <Grid.Row>
                    <Input
                        disabled={this.state.checkingSheet}
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
                  <Grid.Row>
                    <Button
                        primary
                        loading={this.state.checkingSheet}
                        disabled={this.state.checkingSheet}
                        onClick={() => {
                          this.props.displayWoz(this.state.wozUIState);
                        }}>
                      Show WoZ
                    </Button>
                  </Grid.Row>
                </Grid>

              </Segment>


            </Segment>
          </Grid.Column>
        </Grid>
    );
  }

  private _selectSpreadsheetWithID = (
      id: string, data?: IWozCollectionModel) => {
    Store.shared.selectedSpreadsheetID = id;
    const newProvider = new GoogleSheetWozProvider(id);
    if (this.props.state.provider.isEqual(newProvider)) {
      this.setState((prev) => {
        return {
          error: undefined,
          wozUIState: {
            ...this.props.state,
            ...prev.wozUIState.connector,
          },
        };
      });
    } else {
      this.setState((prev) => {
        return {
          error: undefined,
          wozUIState: {
            allWozs: data,
            connector: prev.wozUIState.connector,
            provider: newProvider,
          },
        };
      });
    }
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

    // if this is a known ID, just point to it.
    if (Store.shared.knownSpreadsheets[spreadsheetID] !== undefined) {
      this._selectSpreadsheetWithID(spreadsheetID);
      return;
    }

    this.setState({error: undefined, checkingSheet: true});

    GoogleSheetWozLoader.shared
        .loadDataFromSpreadsheet(spreadsheetID)
        .then((data) => {
          this.setState({checkingSheet: false});
          this._selectSpreadsheetWithID(spreadsheetID, data);
        }, (error) => {
          this.setState({error, checkingSheet: false});
        });
  }
}
