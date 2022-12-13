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
import {Form, Message, Segment} from "semantic-ui-react"
import css from "../../App.module.css"
import {Store} from "../../Store"
import {IRESTModel} from "./rest"

export interface IRESTConnectorComponentProperties {
}

interface IRESTConnectorComponentModel {
  error?: Error
  model: IRESTModel
  errorInCommon?: Error
}

export class RESTConnectorComponent
    extends React.Component<IRESTConnectorComponentProperties, IRESTConnectorComponentModel> {

  constructor(props: IRESTConnectorComponentProperties) {
    super(props)
    this.state = {
      model: Store.shared.rest,
      errorInCommon: this.validate(Store.shared.rest.common)
    }
  }

  private validate = (jsonText: string): Error | undefined => {
    try {
      const text = jsonText.trim()
      if (text.length !== 0) {
        JSON.parse(jsonText)
      }
      return undefined
    } catch (e: any) {
      return e
    }
  }

  public render(): React.ReactNode {
    const changeModel = (value: Partial<IRESTModel>) => {
      this.setState((prev) => {
        const change = {
          ...prev.model,
          ...value,
        }
        Store.shared.rest = change
        return {
          error: undefined,
          model: change,
          errorInCommon: this.validate(change.common)
        }
      })
    }

    const message = (this.state.errorInCommon === undefined)
                    ? null : (<Message negative>
          <p>{this.state.errorInCommon.message}</p>
        </Message>)

    return (
        <Form className={css.connectorEditorSubContainer}>
          <Segment className={css.connectorEditorSubSegment} tertiary>
            <p>
              This connector sends events to the REST API point. The event
              content is defined by the 'json' field in the button description
              (woz.json column in a spreadsheet) plus the additional content
              defined on this page.
            </p>
            <Form.Input
                fluid label={"REST endpoint address"}
                value={this.state.model.address}
                onChange={(_e, data) => {
                  changeModel({address: data.value.trim()})
                }}/>
            <Form.Input
                fluid label={"Common data as JSON"}
                value={this.state.model.common}
                onChange={(_e, data) => {
                  changeModel({common: data.value})
                }}/>
            {message}

          </Segment>
        </Form>
    )
  }
}
