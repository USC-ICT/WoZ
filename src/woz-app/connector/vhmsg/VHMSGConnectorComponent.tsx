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
import {Button, Form, Message, Segment} from "semantic-ui-react"
import {log} from "../../../common/Logger"
import css from "../../App.module.css"
import {Store} from "../../Store"
import {IVHMSGModel, VHMSG} from "./vhmsg"

export interface IVHMSGConnectorComponentProperties {
  vhmsg: VHMSG
}

enum IVHMSGConnectorComponentState {
  CONNECTED,
  CONNECTING,
  DISCONNECTED,
  DISCONNECTING,
}

interface IVHMSGConnectorComponentModel {
  error?: Error
  model: IVHMSGModel
  state: IVHMSGConnectorComponentState
}

export class VHMSGConnectorComponent
    extends React.Component<IVHMSGConnectorComponentProperties,
        IVHMSGConnectorComponentModel> {

  constructor(props: IVHMSGConnectorComponentProperties) {
    super(props)
    this.state = {
      model: this.props.vhmsg.model,
      state: this.props.vhmsg.isConnected
             ? IVHMSGConnectorComponentState.CONNECTED
             : IVHMSGConnectorComponentState.DISCONNECTED,
    }
  }

  public render(): React.ReactNode {

    const config: {
      readonly text: string
      readonly enabled: boolean
      readonly animating: boolean
    } = (() => {
      switch (this.state.state) {
        case IVHMSGConnectorComponentState.CONNECTED:
          return {text: "Disconnect", enabled: false, animating: false}
        case IVHMSGConnectorComponentState.CONNECTING:
          return {text: "Connect", enabled: false, animating: true}
        case IVHMSGConnectorComponentState.DISCONNECTED:
          return {text: "Connect", enabled: true, animating: false}
        case IVHMSGConnectorComponentState.DISCONNECTING:
          return {text: "Disconnect", enabled: false, animating: true}
      }
    })()

    const changeModel = (value: Partial<IVHMSGModel>) => {
      this.setState((prev) => {
        const change = {
          ...prev.model,
          ...value,
        }
        Store.shared.vhmsg = change
        return {
          error: undefined,
          model: change,
          state: prev.state,
        }
      })
    }

    const didConnect = (error?: Error) => {
      if (error !== undefined) {
        log.error(error)
      }
      this.setState((_prev, props) => {
        const isConnected = props.vhmsg.isConnected
        return {
          error,
          model: _prev.model,
          state: isConnected
                 ? IVHMSGConnectorComponentState.CONNECTED
                 : IVHMSGConnectorComponentState.DISCONNECTED,
        }
      })
    }

    const didDisconnect = (error?: Error) => {
      this.setState((prev) => {
        return {
          error,
          model: prev.model,
          state: IVHMSGConnectorComponentState.DISCONNECTED,
        }
      })
    }

    const message = (this.state.error === undefined)
                    ? null : (<Message negative>
          <p>{this.state.error.message}</p>
        </Message>)

    return (
        <Form className={css.connectorEditorSubContainer}>
          <Segment className={css.connectorEditorSubSegment} tertiary>
            <p>
              This connector connects WoZ to
              an <a href={"https://activemq.apache.org"}>activemq</a> server
              and sends events
              using <a
                href={"https://confluence.ict.usc.edu/display/VHTK/VHMsg"}>
              VHMSG protocol</a>.
            </p>
            <Form.Input
                fluid label={"VHMSG Server"}
                disabled={!config.enabled}
                value={this.state.model.address}
                onChange={(_e, data) => {
                  changeModel({address: data.value.trim()})
                }}/>
            <Form.Input
                fluid label={"VHMSG Scope"}
                disabled={!config.enabled}
                placeholder={""}
                value={this.state.model.scope}
                onChange={(_e, data) => {
                  changeModel({scope: data.value.trim()})
                }}/>
            <Form.Checkbox
                label={"Use secure connection"}
                disabled={!config.enabled}
                checked={this.state.model.secure}
                onChange={(_e, data) => {
                  changeModel({secure: data.checked || false})
                }}/>
            {message}
            <Button
                primary
                loading={config.animating}
                disabled={config.animating}
                onClick={() => {
                  if (this.props.vhmsg.isConnected) {
                    this.setState((prev) => {
                      return {
                        error: undefined,
                        model: prev.model,
                        state: IVHMSGConnectorComponentState.DISCONNECTING,
                      }
                    })
                    this.props.vhmsg
                        .disconnect()
                        .then(() => {
                          didDisconnect()
                        })
                        .catch((error: Error) => {
                          didDisconnect(error)
                        })
                  } else {
                    this.setState((prev) => {
                      return {
                        error: undefined,
                        model: prev.model,
                        state: IVHMSGConnectorComponentState.CONNECTING,
                      }
                    })
                    this.props.vhmsg
                        .connect(this.state.model)
                        .then(() => {
                          didConnect()
                        })
                        .catch((error) => {
                          didConnect(error)
                        })
                  }
                }}>{config.text}</Button>
          </Segment>
        </Form>
    )
  }
}
