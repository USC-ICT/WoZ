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
import {stringEncodingHTML} from "../../../common/util"
import {IButtonModel} from "../../../woz/model/ButtonModel"
import {IMessage, Message, ourUserID} from "../../../woz/model/MessageModel"
import {StringMap} from "../../App"
import {Store} from "../../Store"
import {IWozConnector} from "../Connector"
import {IVHMSGModel, VHMSG} from "./vhmsg"
import {VHMSGConnectorComponent} from "./VHMSGConnectorComponent"

/*
  URL arguments

  connector=VHMSG
  address=localhost
  scope=scope
  secure=true|false
 */

export class VHMSGConnector implements IWozConnector {

  constructor() {
    this.id = "VHMSGConnector"
    this.title = "VHMSG"
    this.vhmsg = new VHMSG(Store.shared.vhmsg)
  }

  public get props(): { [index: string]: any | undefined } {
    return {
      connector: this.id,
      ...this.vhmsg.model,
    }
  }

  private messageCount: number = 0

  private _messageTemplate = (buttonModel: IButtonModel): string => {
    if (buttonModel.vhmsg === undefined) {
      if (buttonModel.sender === undefined) {
        buttonModel.sender = "visitor"
      }
      if (buttonModel.addressee === undefined) {
        buttonModel.addressee = "all"
      }
      //noinspection SpellCheckingInspection
      buttonModel.vhmsg =
          "vrExpress $$sender$$ $$addressee$$ $$sender$$$$messageCount$$ "
          + "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\" ?>"
          + "<act><participant id=\"$$XML(sender)$$\" role=\"actor\" /><fml><turn start=\"take\" end=\"give\" />"
          + "<affect type=\"neutral\" target=\"addressee\"></affect><culture type=\"neutral\"></culture>"
          + "<personality type=\"neutral\"></personality></fml><bml><speech id=\"sp1\" ref=\""
          + "$$XML(id)$$"
          + "\" type=\"application/ssml+xml\">"
          + "$$XML(tooltip)$$"
          + "</speech></bml></act>"
      return buttonModel.vhmsg
    } else if (typeof buttonModel.vhmsg === "string") {
      return buttonModel.vhmsg
    } else {
      return ""
    }
  }

  public readonly id: string

  public readonly title: string

  public onMessage?: (message: IMessage) => void

  public readonly vhmsg: VHMSG

  public component = (): any => {
    return React.createElement(VHMSGConnectorComponent, {vhmsg: this.vhmsg},
        null)
  }

  public onUIAppear = (): void => {
    // empty
  }

  // noinspection JSUnusedGlobalSymbols
  public onButtonClick = (buttonModel: IButtonModel) => {

    const buttonModelCopy = Object.assign({}, buttonModel)

    const h = "000000" + Number(this.messageCount++).toString()
    buttonModelCopy.messageCount = h.substr(h.length - 5, 5)

    const message = this._messageTemplate(buttonModelCopy)
                        .replace(/\$\$XML\((.*?)\)\$\$/g,
                            (_match, property) => {
                              return stringEncodingHTML(
                                  buttonModelCopy[property] === undefined
                                  ? ""
                                  : buttonModelCopy[property])
                            })
                        .replace(/\$\$(.*?)\$\$/g, (_match, property) => {
                          return buttonModelCopy[property] === undefined
                                 ? ""
                                 : buttonModelCopy[property]
                        })

    if (this.onMessage !== undefined) {
      this.onMessage(new Message({text: message, userID: ourUserID}))
    }
    this.vhmsg.send(message)
  }

  public connect(params: StringMap): Promise<boolean> {
    const model: IVHMSGModel = {
      address: params.address || "localhost",
      scope: params.scope || VHMSG.DEFAULT_SCOPE,
      secure: (params.secure || "false").toLowerCase() === "true",
    }

    if (this.vhmsg.isConnected) {
      return this.vhmsg.disconnect()
          .then(() => this.vhmsg.connect(model))
          .then(() => true)
    }

    return this.vhmsg.connect(model)
               .then(() => true)
  }

  public get chatUserID(): string {
    return ourUserID
  }
}
