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

import * as XLS from "xlsx"
import {arrayMap, objectFromArray} from "../../../common/util"
import {ColorModel} from "../../../woz/model/ColorModel"
import {IWozCollectionModel, IWozLoadOptions} from "../../../woz/model/Model"
import {WozModel} from "../../../woz/model/WozModel"
import {
  IWozSheets,
  loadWozData,
  parseIndexedColors,
  sheetsFromNameArray,
  SpreadsheetDimension,
} from "../SheetUtils"

const values = async (
    workbook: XLS.WorkBook,
    sheetName: string,
    dimension: SpreadsheetDimension): Promise<any[][]> => {
  const sheet = workbook.Sheets[sheetName]
  if (sheet === undefined) {
    throw new Error("missing sheet with name " + sheetName)
  }

  const rows = XLS.utils.sheet_to_json<any>(sheet, {
    blankrows: false,
    header: 1,
    raw: false,
  })

  if (dimension === SpreadsheetDimension.ROW) {
    return rows
  }

  const columns: any[][] = []

  rows.forEach((row: any[], rowIndex) => {
    row.forEach((value: any, columnIndex) => {
      if (value === undefined) {
        return
      }
      if (columns[columnIndex] === undefined) {
        columns[columnIndex] = []
      }
      columns[columnIndex][rowIndex] = value
    })
  })

  return columns
}

export const parseWorkbook = async (
    workbook: XLS.WorkBook,
    title: string,
    options: IWozLoadOptions): Promise<IWozCollectionModel> => {

  let colors: { [s: string]: ColorModel } | undefined
  if (workbook.Sheets.colors !== null) {
    colors = parseIndexedColors(
        await values(workbook, "colors", SpreadsheetDimension.ROW))
  }

  const sheetsToParse = sheetsFromNameArray(
      workbook.SheetNames, title)

  return {
    title,
    wozs: objectFromArray(arrayMap(
        sheetsToParse, (s: IWozSheets): [string, WozModel] => {
          return [
            s.name,
            new WozModel({
              colors: colors === undefined ? {} : colors,
              contentLoader: () => {
                return loadWozData(
                    (sheetName: string, dimension: SpreadsheetDimension) => {
                      return values(workbook, sheetName, dimension)
                    }, s, options)
              },
              id: s.name,
            }),
          ]
        })),
  }
}
