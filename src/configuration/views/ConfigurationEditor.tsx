import * as React from "react";
import {SyntheticEvent} from "react";
import {
  Button,
  Divider,
  DropdownProps,
  Form,
  Grid,
  Header,
  Icon,
  Segment,
  Select,
} from "semantic-ui-react";
import {Store} from "../../model/Store";
import {arrayMap} from "../../util";
import {IWozCollectionState} from "../../views/WozCollection";
import {ConsoleConnector} from "./ConsoleConnector";
import {FirebaseConnector} from "./FirebaseConnector";
import {VHMSGConnector} from "./VHMSGConnector";

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

export interface IWozConnector {
  id: string;
  title: string;

  render(): any;
}

const CONNECTORS: IWozConnector[] = [
  new ConsoleConnector({}),
  new FirebaseConnector({}),
  new VHMSGConnector({}),
];

export class ConfigurationEditor
    extends React.Component<IConfigurationEditorProperties, IConfigurationEditorState> {

  constructor(props: IConfigurationEditorProperties) {
    super(props);

    this.state = {
      connectorID: "ConsoleConnector",
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

    const connectors = arrayMap(CONNECTORS, (c) => {
      return {key: c.id, value: c.id, text: c.title};
    });

    const connectorWithID = (id: string): any => {
      const c = CONNECTORS.find((x) => x.id === id);
      if (c === undefined) {
        return null;
      }
      return c.render();
    };

    const subSegmentStyle = {backgroundColor: "#f0f0f0"};

    return (
        <Grid textAlign="center" style={{height: "100%"}}
              verticalAlign="middle">
          <Grid.Column style={{maxWidth: 650}}>
            <Header as="h2" textAlign="center">
              <Icon name={"cog"}/> Configure WoZ
            </Header>
            <Segment placeholder>
              <Segment style={subSegmentStyle}>
                <Grid columns={1} textAlign="center"
                      style={{height: "100%"}}
                      verticalAlign="top">
                  <Grid.Row textAlign="center">
                    <Grid.Column style={{width: "500px;"}}>
                      <Header>
                        Connector
                      </Header>
                      <Select options={connectors}
                              onChange={(
                                  _event: SyntheticEvent<HTMLElement>,
                                  data: DropdownProps) => {
                                this.setState(() => {
                                  return {
                                    connectorID: data.value as string,
                                  };
                                });
                              }}
                              value={this.state.connectorID}
                              style={{maxWidth: 300}}/>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row textAlign="center">
                    <Grid.Column style={{width: "500px;"}}>
                      {connectorWithID(this.state.connectorID)}
                    </Grid.Column>
                  </Grid.Row>

                </Grid>
              </Segment>

              <Segment style={subSegmentStyle}>
                <Grid columns={1} textAlign="center"
                      style={{height: "100%"}}
                      verticalAlign="middle">
                  <Grid.Row textAlign="center">
                    <Grid.Column style={{width: "500px;"}}>
                      <Header>
                        Select a recent WoZ spreadsheet
                      </Header>
                      <Form.Select fluid options={knownSheets}
                                   value={Store.shared.selectedSpreadsheetID}/>
                    </Grid.Column>
                  </Grid.Row>

                  <Divider horizontal>Or</Divider>

                  <Grid.Row textAlign="center">
                    <Grid.Column style={{width: "500px;"}}>
                      <Header>
                        Enter a new WoZ spreadsheet URL
                      </Header>
                      <Form.Input fluid style={{width: "300px;"}}
                                  placeholder={"Google spreadsheet URL"}/>
                    </Grid.Column>
                  </Grid.Row>

                  <Grid.Row textAlign="center">
                    <Grid.Column style={{width: "500px;"}}>
                      <Button primary>
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

}
