import * as React from "react";
import {Button, Form, Segment} from "semantic-ui-react";
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

    const subSegmentStyle = {backgroundColor: "#e0e0e0", width: "300px"};

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

    return (
        <Form>
          <Segment style={subSegmentStyle}>
            <Form.Input fluid label={"VHMSG Server"}
                        disabled={!config.enabled}
                        placeholder={"host"}
                        value={this.state.model.address}
                        onChange={(_e, data) => {
                          const change = {
                            ...this.state.model,
                            ...{address: data.value as string},
                          };
                          Store.shared.vhmsg = change;
                          this.setState({model: change});
                        }}/>
            <Form.Input fluid label={"VHMSG Scope"}
                        disabled={!config.enabled}
                        placeholder={""}
                        value={this.state.model.scope}
                        onChange={(_e, data) => {
                          const change = {
                            ...this.state.model,
                            ...{scope: data.value as string},
                          };
                          Store.shared.vhmsg = change;
                          this.setState({model: change});
                        }}/>
            <Form.Checkbox label={"Use secure connection"}
                           disabled={!config.enabled}
                           checked={this.state.model.secure}
                           onChange={(_e, data) => {
                             const change = {
                               ...this.state.model,
                               ...{secure: data.checked || false},
                             };
                             Store.shared.vhmsg = change;
                             this.setState({model: change});
                           }}/>
            <Button primary
                    loading={config.animating}
                    disabled={config.animating}
                    onClick={() => {
                      if (this.props.vhmsg.isConnected) {
                        this.setState({
                          state: IVHMSGConnectorComponentState.DISCONNECTING,
                        });
                        this.props.vhmsg
                            .disconnect()
                            .then(() => {
                                  this.setState({
                                    state: IVHMSGConnectorComponentState.DISCONNECTED,
                                  });
                                },
                                () => {
                                  this.setState({
                                    state: IVHMSGConnectorComponentState.DISCONNECTED,
                                  });
                                });
                      } else {
                        this.setState({
                          state: IVHMSGConnectorComponentState.CONNECTING,
                        });
                        this.props.vhmsg
                            .connect(this.state.model)
                            .then(() => {
                                  const isConnected1 = this.props.vhmsg.isConnected;
                                  this.setState({
                                    state: isConnected1
                                        ? IVHMSGConnectorComponentState.CONNECTED
                                        : IVHMSGConnectorComponentState.DISCONNECTED,
                                  });
                                },
                                (error) => {
                                  log.error(error);
                                  const isConnected2 = this.props.vhmsg.isConnected;
                                  this.setState({
                                    state: isConnected2
                                        ? IVHMSGConnectorComponentState.CONNECTED
                                        : IVHMSGConnectorComponentState.DISCONNECTED,
                                  });
                                });
                      }
                    }}>{config.text}</Button>
          </Segment>
        </Form>
    );
  }
}
