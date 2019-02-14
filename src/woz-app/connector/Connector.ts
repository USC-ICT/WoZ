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

import {IButtonModel} from "../../woz/model/ButtonModel"
import {Store} from "../Store"
import {ADConnector} from "./agent-dialogue/ADConnector"
import {ConsoleConnector} from "./console/ConsoleConnector"
import {VHMSGConnector} from "./vhmsg/VHMSGConnector"

export interface IWozConnector {
  id: string
  title: string

  component(): any

  onButtonClick(buttonModel: IButtonModel): void

  onUIAppear(): void
}

export class WozConnectors {

  public get selectedConnectorID(): string {
    const currentID = Store.shared.selectedConnectorID !== undefined
                      ? Store.shared.selectedConnectorID : this.all[0].id
    return this.all.find(
        (c) => c.id === currentID) !== undefined
           ? currentID : this.all[0].id
  }

  // noinspection JSMethodCanBeStatic
  public set selectedConnectorID(newValue: string) {
    Store.shared.selectedConnectorID = newValue
  }

  public get selectedConnector(): IWozConnector {
    const connector = this.all.find((c) => c.id === this.selectedConnectorID)
    if (connector !== undefined) {
      return connector
    }
    return this.all[0]
  }

  constructor() {
    this.all = [
      new ConsoleConnector(),
      new ADConnector(),
      new VHMSGConnector(),
    ]
  }

  public static shared = new WozConnectors()

  public readonly all: IWozConnector[]
}
