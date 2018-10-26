import * as React from "react";
import {Button, Form, Segment} from "semantic-ui-react";
import {IWozConnector} from "./ConfigurationEditor";

export class VHMSGConnector extends React.Component<{}, {}> implements IWozConnector {

  public readonly id: string;
  public readonly title: string;

  constructor(props: any) {
    super(props);
    this.id = "VHMSGConnector";
    this.title = "VHMSG";
  }

  public render() {

    const subSegmentStyle = {backgroundColor: "#e0e0e0"};

    return (
        <Form>
          <Segment style={subSegmentStyle}>
            <Form.Input fluid label={"VHMSG Server"}
                        placeholder={"host[:port]"}/>
            <Form.Input fluid label={"VHMSG Scope"}
                        placeholder={""}/>
            <Button primary>Connect</Button>
          </Segment>
        </Form>
    );
  }
}
