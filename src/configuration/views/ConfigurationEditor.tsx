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
  Segment,
  Select,
} from "semantic-ui-react";
import {Store} from "../../model/Store";
import {arrayMap} from "../../util";
import {IWozCollectionState} from "../../views/WozCollection";
import {WozConnectors} from "../connector/Connector";

// interface IConfigurationEditorState {
//
// }

interface IConfigurationEditorProperties {
  state: IWozCollectionState;
  displayWoz: (state: IWozCollectionState) => void;
}

interface IConfigurationEditorState {
  spreadsheetID: string;
  connectorID: string;
}

export class ConfigurationEditor
    extends React.Component<IConfigurationEditorProperties, IConfigurationEditorState> {

  constructor(props: IConfigurationEditorProperties) {
    super(props);

    this.state = {
      connectorID: WozConnectors.shared.selectedConnectorID,
      spreadsheetID: Store.shared.selectedSpreadsheetID,
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

    const connectorWithID = (id: string): any => {
      const c = WozConnectors.shared.all.find((x) => x.id === id);
      if (c === undefined) {
        return null;
      }
      return c;
    };

    const subSegmentStyle = {backgroundColor: "#f0f0f0"};

    return (
        <Grid centered style={{height: "100%"}}
              verticalAlign="middle">
          <Grid.Column style={{maxWidth: 650}}>
            <Header as="h2" textAlign="center">
              <Icon name={"cog"}/> Configure WoZ
            </Header>
            <Segment placeholder>
              <Segment style={subSegmentStyle}>
                <Grid columns={1} centered
                      style={{height: "100%"}}
                      verticalAlign="top">
                  <Grid.Row textAlign="center">
                    <Header>
                      Select Connector<br/>
                      <span style={{fontWeight: "normal"}}>
                      How the button event will be
                      dispatched
                      </span>
                    </Header>

                  </Grid.Row>
                  <Grid.Row textAlign="center">
                    <Select options={connectors}
                            onChange={(
                                _event: SyntheticEvent<HTMLElement>,
                                data: DropdownProps) => {
                              this.setState(() => {
                                const id = data.value as string;
                                WozConnectors.shared.selectedConnectorID = id;
                                return {
                                  connectorID: id,
                                };
                              });
                            }}
                            value={this.state.connectorID}
                            style={{maxWidth: 300}}/>
                  </Grid.Row>
                  <Grid.Row textAlign="center" columns={16}>
                    {connectorWithID(this.state.connectorID).component()}
                  </Grid.Row>

                </Grid>
              </Segment>

              <Segment style={subSegmentStyle}>
                <Grid columns={1} centered
                      style={{height: "100%"}}
                      verticalAlign="middle">
                  <Grid.Row>
                    <Header>
                      Select a recent WoZ spreadsheet
                    </Header>
                  </Grid.Row>
                  <Grid.Row>
                    <Select options={knownSheets}
                            value={Store.shared.selectedSpreadsheetID}
                            onChange={(_e, data) => {
                              const newValue = data.value as string;
                              this.setState(() => {
                                Store.shared.selectedSpreadsheetID = newValue;
                                return {spreadsheetID: newValue};
                              });
                            }}/>
                  </Grid.Row>

                  <Divider horizontal>Or</Divider>

                  <Grid.Row>
                    <Header>
                      Enter a new WoZ spreadsheet URL
                    </Header>
                  </Grid.Row>
                  <Grid.Row>
                    <Input style={{width: "90%"}} fluid
                           placeholder={"Google spreadsheet URL"}
                           onChange={(_e, data) => {
                             const newValue = this._extractSpreadsheetID(
                                 data.value as string);
                             this.setState(() => {
                               Store.shared.selectedSpreadsheetID = newValue;
                               return {spreadsheetID: newValue};
                             });
                           }}/>
                  </Grid.Row>

                  <Grid.Row textAlign="center">
                    <Grid.Column>
                      <Button primary
                              onClick={() => {
                                const newState = this.props.state.spreadsheetID === this.state.spreadsheetID
                                    ? this.props.state : {spreadsheetID: this.state.spreadsheetID};
                                this.props.displayWoz({
                                  ...newState,
                                  ...{connector: WozConnectors.shared.selectedConnector},
                                });
                              }}>
                        Show WoZ
                      </Button>

                    </Grid.Column>
                  </Grid.Row>
                </Grid>

              </Segment>


            </Segment>
          </Grid.Column>
        </Grid>
    );
  }

  private _extractSpreadsheetID = (url: string): string => {
    return url.split("/").reduce((previousValue, currentValue) => {
      return previousValue.length > currentValue.length ? previousValue : currentValue;
    }, "");
  }
}
