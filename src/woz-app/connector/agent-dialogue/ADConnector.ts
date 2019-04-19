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
import {log} from "../../../common/Logger"
import {IButtonModel} from "../../../woz/model/ButtonModel"
import {Message} from "../../../woz/model/MessageModel"
import {StringMap} from "../../App"
import {Store} from "../../Store"
import {IWozConnector} from "../Connector"
import {ADConnection, ISubscription} from "./ADConnection"
import {ADConnectorComponent} from "./ADConnectorComponent"

export interface IADConnectorModel {
  readonly conversationId?: string
  readonly serverURL: string
  readonly userId?: string
}

/*
 URL arguments

 connector=ADConnector
 serverURL=
 conversationID=
 userID=
 */

export class ADConnector implements IWozConnector {
  constructor() {
    this.id = "ADConnector"
    this.title = "Agent Dialogue"
    this._model = Store.shared.agentDialogue
  }

  private service?: ADConnection
  private stream?: ISubscription

  public readonly id: string

  public readonly title: string

  public _model: IADConnectorModel

  public component = (): any => {
    return React.createElement(
        ADConnectorComponent, {connector: this}, null)
  }

  // noinspection JSUnusedGlobalSymbols
  public onUIAppear = (): void => {
    this.subscribe()
  }

  public get connection(): ADConnection {
    if (this.service !== undefined) {
      if (this.service.hostURL === this.model.serverURL) {
        return this.service
      }
      this.service.terminate()
    }
    return this.service = new ADConnection(this.model.serverURL)
  }

  public get model(): IADConnectorModel {
    return this._model
  }

  public set model(value: IADConnectorModel) {
    if (value.userId === this.model.userId
        && value.conversationId === this.model.conversationId
        && value.serverURL === this.model.serverURL) {
      return
    }

    if (this.stream !== undefined) {
      this.stream.invalidate()
      this.stream = undefined
    }

    if (this.service !== undefined) {
      this.service.terminate()
      this.service = undefined
    }

    this._model = value
  }

  public subscribe = (): ISubscription | undefined => {
    if (this.stream !== undefined) { return this.stream }

    if (this.model.userId === undefined
        || this.model.conversationId === undefined) {
      return undefined
    }

    return this.stream = this.connection.subscribe({
      conversationID: this.model.conversationId,
      onResponse: (response) => {
        log.debug(response.toObject())
      },
      userID: this.model.userId,
    })
  }

  // noinspection JSUnusedGlobalSymbols
  public onButtonClick = (buttonModel: IButtonModel) => {

    if (this.model.userId === undefined
        || this.model.conversationId === undefined) {
      return
    }

    const message = new Message({
      text: buttonModel.tooltip,
      userID: this.model.userId,
    })

    this.connection.send(message, {
      conversationID: this.model.conversationId,
    })

    log.debug("clicked:", "'" + buttonModel.id + "'", buttonModel.tooltip)
  }

  public connect(params: StringMap): Promise<boolean> {
    if (params.userID !== undefined
        && params.conversationID !== undefined
        && params.serverURL !== undefined) {
      const model: IADConnectorModel = {
        conversationId: params.conversationID,
        serverURL: params.serverURL,
        userId: params.userID,
      }
      this.model = model
      return new Promise((resolve) => {resolve(true)})
    }
    return new Promise((resolve) => {resolve(false)})
  }
}
