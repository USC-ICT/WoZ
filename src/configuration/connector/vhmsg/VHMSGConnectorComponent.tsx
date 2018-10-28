import * as React from "react";
import {Button, Form, Message, Segment} from "semantic-ui-react";
import {log} from "../../../controller/Logger";
import {Store} from "../../../model/Store";
import {IVHMSGModel, VHMSG} from "./vhmsg";

export interface IVHMSGConnectorComponentProperties {
  vhmsg: VHMSG;
}

enum IVHMSGConnectorComponentState {
  CONNECTED,
  CONNECTING,
  DISCONNECTED,
  DISCONNECTING,
}

interface IVHMSGConnectorComponentModel {
  error?: Error;
  model: IVHMSGModel;
  state: IVHMSGConnectorComponentState;
}

export class VHMSGConnectorComponent
    extends React.Component<IVHMSGConnectorComponentProperties,
        IVHMSGConnectorComponentModel> {

  constructor(props: any) {
    super(props);
    this.state = {
      model: this.props.vhmsg.model,
      state: this.props.vhmsg.isConnected
          ? IVHMSGConnectorComponentState.CONNECTED
          : IVHMSGConnectorComponentState.DISCONNECTED,
    };
  }

  public render() {

    const subSegmentStyle = {backgroundColor: "#e0e0e0", width: "100%"};

    const config: {
      readonly text: string;
      readonly enabled: boolean;
      readonly animating: boolean;
    } = (() => {
      switch (this.state.state) {
        case IVHMSGConnectorComponentState.CONNECTED:
          return {text: "Disconnect", enabled: false, animating: false};
        case IVHMSGConnectorComponentState.CONNECTING:
          return {text: "Connect", enabled: false, animating: true};
        case IVHMSGConnectorComponentState.DISCONNECTED:
          return {text: "Connect", enabled: true, animating: false};
        case IVHMSGConnectorComponentState.DISCONNECTING:
          return {text: "Disconnect", enabled: false, animating: true};
      }
    })();

    const changeModel = (value: Partial<IVHMSGModel>) => {
     this.setState((prev) => {
       const change = {
         ...prev.model,
         ...value,
       };
       Store.shared.vhmsg = change;
       return {
          error: undefined,
          model: change,
        };
      });
    };

    const didConnect = (error?: Error) => {
      if (error !== undefined) {
        log.error(error);
      }
      const isConnected = this.props.vhmsg.isConnected;
      this.setState({
        error,
        state: isConnected
            ? IVHMSGConnectorComponentState.CONNECTED
            : IVHMSGConnectorComponentState.DISCONNECTED,
      });
    };

    const didDisconnect = (error?: Error) => {
      this.setState({
        error,
        state: IVHMSGConnectorComponentState.DISCONNECTED,
      });
    };

    const message = (this.state.error === undefined)
        ? null : (<Message negative>
          <p>{this.state.error.message}</p>
        </Message>);

    return (
        <Form style={{width: "90%"}}>
          <Segment style={subSegmentStyle}>
            <Form.Input
                fluid label={"VHMSG Server"}
                disabled={!config.enabled}
                value={this.state.model.address}
                onChange={(_e, data) => {
                  changeModel({address: data.value as string});
                }}/>
            <Form.Input
                fluid label={"VHMSG Scope"}
                disabled={!config.enabled}
                placeholder={""}
                value={this.state.model.scope}
                onChange={(_e, data) => {
                  changeModel({scope: data.value as string});
                }}/>
            <Form.Checkbox
                label={"Use secure connection"}
                disabled={!config.enabled}
                checked={this.state.model.secure}
                onChange={(_e, data) => {
                  changeModel({secure: data.checked || false});
                }}/>
            {message}
            <Button
                primary
                loading={config.animating}
                disabled={config.animating}
                onClick={() => {
                  if (this.props.vhmsg.isConnected) {
                    this.setState({
                      error: undefined,
                      state: IVHMSGConnectorComponentState.DISCONNECTING,
                    });
                    this.props.vhmsg
                        .disconnect()
                        .then(() => {
                              didDisconnect();
                            },
                            (error: Error) => {
                              didDisconnect(error);
                            });
                  } else {
                    this.setState({
                      error: undefined,
                      state: IVHMSGConnectorComponentState.CONNECTING,
                    });
                    this.props.vhmsg
                        .connect(this.state.model)
                        .then(() => {
                              didConnect();
                            },
                            (error) => {
                              didConnect(error);
                            });
                  }
                }}>{config.text}</Button>
          </Segment>
        </Form>
    );
  }
}
