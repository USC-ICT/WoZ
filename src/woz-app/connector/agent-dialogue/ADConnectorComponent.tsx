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
import {Form, Input, Segment} from "semantic-ui-react"
import css from "../../App.module.css"
import {Store} from "../../Store"
import {ADConnector, IADConnectorModel} from "./ADConnector"

export interface IADConnectorComponentProperties {
  connector: ADConnector
}

export class ADConnectorComponent
    extends React.Component<IADConnectorComponentProperties, {}> {

  public render() {

    const changeModel = (value: Partial<IADConnectorModel>) => {
      this.setState((_prev, props) => {
        const newValue = {
          ...props.connector.model,
          ...value,
        }
        Store.shared.agentDialogue = newValue
        this.props.connector.model = newValue
        return {}
      })
    }

    // we want to make the inputs a bit wider then default, we need
    // to do <field><label><input>

    return (
        <Form className={css.connectorEditorSubContainer}>
          <Segment className={css.connectorEditorSubSegment} tertiary>
            <p>
              This connector
              uses <a href={"https://github.com/grill-lab/agent-dialogue"}>
              AgentDialogue</a> protobuf protocol to communicate
              with an AgentDialogue server.
            </p>
            <Form.Field className={css.firebaseInputField}>
              <label>Server URL</label>
              <Input
                  value={this.props.connector.model.serverURL}
                  onChange={(_e, data) => {
                    changeModel({serverURL: (data.value as string).trim()})
                  }}/>
            </Form.Field>
            <Form.Field className={css.firebaseInputField}>
              <label>User ID</label>
              <Input
                  value={this.props.connector.model.userId}
                  onChange={(_e, data) => {
                    changeModel({userId: (data.value as string).trim()})
                  }}/>
            </Form.Field>
            <Form.Field className={css.firebaseInputField}>
              <label>Conversation ID</label>
              <Input
                  value={this.props.connector.model.conversationId}
                  onChange={(_e, data) => {
                    changeModel({conversationId: (data.value as string).trim()})
                  }}/>
            </Form.Field>
            {/*<Button primary>Connect</Button>*/}
          </Segment>
        </Form>
    )
  }
}
