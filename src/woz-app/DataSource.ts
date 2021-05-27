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

import {arrayCompactMap, objectFromArray} from "../common/util"
import {IWozDataSource} from "../woz/model/Model"
import {ExcelURLDataSource} from "../woz/provider/excel/ExcelURLDataSource"
import {GoogleSheetWozDataSource} from "../woz/provider/google/GoogleSheetWozDataSource"
import {IStoredSpreadsheet, Store} from "./Store"

const dataSourceForID =
    (id: string, sheet: IStoredSpreadsheet): IWozDataSource | undefined => {
  const lowercasedURL = id.toLowerCase()

  // noinspection SpellCheckingInspection
  if (lowercasedURL.endsWith(".xlsx") || lowercasedURL.endsWith(".xls")) {
    return new ExcelURLDataSource({
      lastAccess: sheet.lastAccess,
      title: sheet.title,
      url: id,
    })
  }

  if (id === "") {
    return undefined
  }

  return new GoogleSheetWozDataSource({
    lastAccess: sheet.lastAccess,
    spreadsheetID: id,
    title: sheet.title,
  })
}

export class DataSources {
  public static shared = new DataSources()

  // noinspection JSMethodCanBeStatic
  public get selectedDataSource(): IWozDataSource | undefined {
    const id = Store.shared.selectedSpreadsheetID
    if (id === undefined) {
      return undefined
    }
    const sheet = Store.shared.knownSpreadsheets[id]
    // noinspection JSIncompatibleTypesComparison
    if (sheet === undefined) {
      return undefined
    }
    return dataSourceForID(id, sheet)
  }

  // noinspection JSMethodCanBeStatic
  public set selectedDataSource(newValue: IWozDataSource | undefined) {
    if (newValue === undefined) {
      Store.shared.selectedSpreadsheetID = undefined
    } else if (newValue.shouldPersist) {
      Store.shared.selectedSpreadsheetID = newValue.id
    } else {
      Store.shared.selectedSpreadsheetID = undefined
    }
  }

  public get recentDataSources(): { [id: string]: IWozDataSource } {
    return objectFromArray(arrayCompactMap(
        Object.entries(Store.shared.knownSpreadsheets),
        ([id, sheet]): [string, IWozDataSource] | undefined => {
          const dataSource = dataSourceForID(id, sheet)
          return dataSource === undefined ? undefined : [id, dataSource]
        }))
  }
}
