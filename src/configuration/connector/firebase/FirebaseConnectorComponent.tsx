import * as React from "react";
import {Button, Form, Segment} from "semantic-ui-react";

export class FirebaseConnectorComponent extends React.Component<{}, {}> {

  constructor(props: any) {
    super(props);
  }

  public render() {

    const subSegmentStyle = {backgroundColor: "#e0e0e0"};

    return (
        <Form>
          <Segment style={subSegmentStyle}>
            {/*<Form.Input fluid label={"VHMSG Server"}*/}
                        {/*placeholder={"host[:port]"}/>*/}
            {/*<Form.Input fluid label={"VHMSG Scope"}*/}
                        {/*placeholder={""}/>*/}
            <Button primary>Connect</Button>
          </Segment>
        </Form>
    );
  }
}
