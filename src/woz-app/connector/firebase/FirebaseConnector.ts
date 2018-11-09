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
import {request} from "../../../common/util"
import {IButtonModel} from "../../../woz/model/ButtonModel"
import {Store} from "../../Store"
import {IWozConnector} from "../Connector"
import {FirebaseConnectorComponent} from "./FirebaseConnectorComponent"

export interface IFirebaseConnectorModel {
  conversationId?: string
  serverURL: string
  userId?: string
}

export class FirebaseConnector implements IWozConnector {
  constructor() {
    this.id = "FirebaseConnector"
    this.title = "Firebase"
    this.model = Store.shared.firebase
  }

  public readonly id: string

  public readonly title: string

  public model: IFirebaseConnectorModel

  public component = (): any => {
    return React.createElement(
        FirebaseConnectorComponent, {connector: this}, null)
  }

  // noinspection JSUnusedGlobalSymbols
  public onButtonClick = (buttonModel: IButtonModel) => {

    if (this.model.userId === undefined
        || this.model.conversationId === undefined) {
      return
    }

    request(
        {
          content: {
            agent_request_parameters: {
              conversationId: this.model.conversationId,
            },
            chosen_agents: "WizardOfOz",
            language: "en-US",
            textInput: buttonModel.tooltip,
            userId: this.model.userId,
          },
          headers: {
            Operation: "sendRequest",
          },
          method: "POST",
          url: this.model.serverURL,
        })
        .then(() => {
          log.debug("success", buttonModel)
        }, (err) => {
          log.error(err)
        })

    log.debug("clicked:", "'" + buttonModel.id + "'", buttonModel.tooltip)
  }
}
