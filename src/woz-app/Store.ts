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

import {IFirebaseConnectorModel} from "./connector/firebase/FirebaseConnector"
import {IVHMSGModel, VHMSG} from "./connector/vhmsg/vhmsg"

interface IStoredSpreadsheet {
  title: string
  lastAccess: Date
}

interface IStore {
  firebase: IFirebaseConnectorModel
  generateScreenNavigation: boolean
  selectedSpreadsheetID?: string
  knownSpreadsheets: { [s: string]: IStoredSpreadsheet }
  selectedConnectorID?: string
  vhmsg: IVHMSGModel
}

export class Store implements IStore {

  constructor() {

    // noinspection SpellCheckingInspection
    const defaultID = "1xaWdhQboriqFU3YLDqe4GXFPRPaO9QGtYoR9ZKk8oOo"

    // Important!!! Only use constant expressions here.

    this.defaults = {
      firebase: {
        conversationId: "test",
        serverURL: "http://cors-anywhere.herokuapp.com/http://104.198.142.178/ad-client-service-servlet",
        userId: "test",
      },
      generateScreenNavigation: true,
      knownSpreadsheets: {
        [defaultID]: {title: "Basic WoZ Test", lastAccess: new Date()},
      },
      selectedSpreadsheetID: defaultID,
      vhmsg: {address: "127.0.0.1", scope: VHMSG.DEFAULT_SCOPE, secure: false},
    }

    return new Proxy(this, {
      get: (_target, property): any => {
        if (typeof property !== "string") {
          return undefined
        }
        const value = localStorage.getItem(property)
        if (value !== undefined && value !== null) {
          return JSON.parse(value)
        }
        // @ts-ignore
        return this.defaults[property]
      },

      set: (_target, property, newValue): boolean => {
        if (typeof property !== "string") {
          return false
        }
        localStorage.setItem(property, JSON.stringify(newValue))
        return true
      },
    })
  }

  private readonly defaults: IStore

  public static shared = new Store()

  // @ts-ignore
  public generateScreenNavigation: boolean

  // @ts-ignore
  public selectedSpreadsheetID?: string

  // @ts-ignore
  public knownSpreadsheets: { [s: string]: IStoredSpreadsheet }

  // @ts-ignore
  public selectedConnectorID?: string

  // @ts-ignore
  public vhmsg: IVHMSGModel

  // @ts-ignore
  public firebase: IFirebaseConnectorModel
}
