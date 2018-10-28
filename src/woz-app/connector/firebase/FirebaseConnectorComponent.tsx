import * as React from "react";
import {Form, Input, Segment} from "semantic-ui-react";
import {Store} from "../../Store";
import {FirebaseConnector, IFirebaseConnectorModel} from "./FirebaseConnector";

export interface IFirebaseConnectorComponentProperties {
  connector: FirebaseConnector;
}

export class FirebaseConnectorComponent
    extends React.Component<IFirebaseConnectorComponentProperties, {}> {

  constructor(props: any) {
    super(props);
  }

  public render() {

    const subSegmentStyle = {
      backgroundColor: "#e0e0e0",
      width: "90%",
    };
    const fieldStyle = {maxWidth: "20rem"};

    const changeModel = (value: Partial<IFirebaseConnectorModel>) => {
      this.setState(() => {
        const newValue = {
          ...this.props.connector.model,
          ...value,
        };
        Store.shared.firebase = newValue;
        this.props.connector.model = newValue;
        return {};
      });
    };

    // we want to make the inputs a bit wider then default, we need
    // to do <field><label><input>

    return (
        <Segment style={subSegmentStyle}>
          <Form>
            <Form.Field
                style={fieldStyle}
              >
              <label>Server URL</label>
              <Input
                  value={this.props.connector.model.serverURL}
                  onChange={(_e, data) => {
                    changeModel({serverURL: data.value as string});
                  }}/>
            </Form.Field>
            <Form.Field
                style={fieldStyle}
                >
              <label>Server URL</label>
              <Input
                  value={this.props.connector.model.userId}
                  onChange={(_e, data) => {
                    changeModel({userId: data.value as string});
                  }}/>
            </Form.Field>
            <Form.Field
                style={fieldStyle}
                >
              <label>Conversation ID</label>
              <Input
                  value={this.props.connector.model.conversationId}
                  onChange={(_e, data) => {
                    changeModel({conversationId: data.value as string});
                  }}/>
            </Form.Field>
            {/*<Button primary>Connect</Button>*/}
          </Form>
        </Segment>
    );
  }
}
