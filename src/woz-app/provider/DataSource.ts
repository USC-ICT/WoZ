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

import {arrayMap, objectFromArray} from "../../common/util"
import {IWozDataSource} from "../../woz/model/Model"
import {Store} from "../Store"
import {GoogleSheetWozDataSource} from "./google/GoogleSheetWozDataSource"

export class DataSources {
  public static shared = new DataSources()

  // noinspection JSMethodCanBeStatic
  public get selectedDataSource(): IWozDataSource | undefined {
    const id = Store.shared.selectedSpreadsheetID
    if (id === undefined) {
      return undefined
    }
    const sheet = Store.shared.knownSpreadsheets[id]
    if (sheet === undefined) {
      return undefined
    }
    return new GoogleSheetWozDataSource({
      lastAccess: sheet.lastAccess,
      spreadsheetID: id,
      title: sheet.title,
    })
  }

  // noinspection JSMethodCanBeStatic
  public set selectedDataSource(newValue: IWozDataSource | undefined) {
    if (newValue !== undefined && newValue instanceof GoogleSheetWozDataSource) {
      Store.shared.selectedSpreadsheetID = newValue.id
    } else {
      Store.shared.selectedSpreadsheetID = undefined
    }
  }

  public get recentDataSources(): {[id: string]: IWozDataSource } {
    return objectFromArray(arrayMap(
        Object.entries(Store.shared.knownSpreadsheets),
        ([id, sheet]): [string, IWozDataSource] => {
          return [id, new GoogleSheetWozDataSource({
            lastAccess: sheet.lastAccess,
            spreadsheetID: id,
            title: sheet.title,
          })]
        }))
  }
}
