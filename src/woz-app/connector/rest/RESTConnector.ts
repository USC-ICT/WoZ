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
import {IMessage, Message, ourUserID} from "../../../woz/model/MessageModel"
import {StringMap} from "../../App"
import {Store} from "../../Store"
import {IWozConnector} from "../Connector"
import {RESTConnectorComponent} from "./RESTConnectorComponent"

export class RESTConnector implements IWozConnector {

  public readonly id: string

  public readonly title: string

  public onMessage?: (message: IMessage) => void

  public get props(): { [index: string]: any | undefined } {
    return {
      connector: this.id,
    }
  }

  constructor() {
    this.id = "RESTConnector"
    this.title = "REST"
  }

  public component = (): any => {
    return React.createElement(RESTConnectorComponent, {}, null)
  }

  // noinspection JSUnusedGlobalSymbols
  public onButtonClick = (buttonModel: IButtonModel): void => {
    log.debug("clicked:", buttonModel)
    const onMessage = this.onMessage

    let common = {}
    try {
      const text = Store.shared.rest.common.trim()
      if (text.length !== 0) {
        common = JSON.parse(Store.shared.rest.common)
      }
    } catch (e) {
      console.error("failed to parse", Store.shared.rest.common)
    }

    window.fetch(Store.shared.rest.address, {
      method: "POST",
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        ...common,
        ...buttonModel,
      }),
    })
          .then(response => response.json())
          .then(response => {
            console.log(response)
            if (onMessage !== undefined) {
              onMessage(new Message({
                // eslint-disable-next-line
                // @typescript-eslint/restrict-plus-operands
                text: "clicked: " + buttonModel, userID: ourUserID,
              }))
            }
          })
          .catch(error => {
            console.error(error)
          })
  }

  public onUIAppear = (): void => {
    // empty
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public connect(_params: StringMap): Promise<boolean> {
    return new Promise((resolve) => {resolve(true)})
  }

  public get chatUserID(): string {
    return ourUserID
  }
}
