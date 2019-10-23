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

import {
  appendingPathExtension,
  arrayCompactMap,
  arrayMap,
  objectFromArray,
  pathExtension,
  removingPathExtension,
} from "../../common/util"
import {ButtonModel, IButtonModel} from "../model/ButtonModel"
import {ColorModel} from "../model/ColorModel"
import {IWozLoadOptions} from "../model/Model"
import {RowModel} from "../model/RowModel"
import {ScreenModel} from "../model/ScreenModel"
import {generateScreenTabs, IWozContent} from "../model/WozModel"

const BUTTON_EXT: string = "buttons"
const ROW_EXT: string = "rows"
const SCREENS_EXT: string = "screens"

export interface IWozSheets {
  readonly buttons: string[]
  readonly name: string
  readonly rows: string[]
  readonly screens: string[]
}

export enum SpreadsheetDimension {
  ROW = "ROW",
  COLUMN = "COLUMN",
}

export type SpreadsheetValuesCallback =
    (sheetName: string, dimension: SpreadsheetDimension) => Promise<any[][]>

export const sheetsFromNameArray = (
    names: string[],
    title: string): IWozSheets[] => {
  const namesAsSet = new Set(names)

  let buttonSheetNames = names
      .filter((value) => value.endsWith("." + BUTTON_EXT))

  if (buttonSheetNames.length === 0) {
    buttonSheetNames = buttonSheetNames.concat(["." + BUTTON_EXT])
  }

  return arrayCompactMap(buttonSheetNames, (value) => {
    const baseName = removingPathExtension(value)

    const name = (baseName.length === 0) ? title : baseName
    const buttons = [BUTTON_EXT, appendingPathExtension(baseName, BUTTON_EXT)]
        .filter((sheetName) => namesAsSet.has(sheetName))
    const rows = [ROW_EXT, appendingPathExtension(baseName, ROW_EXT)]
        .filter((sheetName) => namesAsSet.has(sheetName))
    const screens = [SCREENS_EXT, appendingPathExtension(baseName, SCREENS_EXT)]
        .filter((sheetName) => namesAsSet.has(sheetName))

    if (rows.length === 0 || buttons.length === 0) {
      return undefined
    }

    return {
      buttons,
      name,
      rows,
      screens,
    }
  })
}

const extractKeys = (buttonRowValues: any[]): string[] => {
  return arrayMap(buttonRowValues[0], (v: string): string => {
    v = v.trim()
    if (v.toLocaleLowerCase() === "answer") {
      // legacy exception
      return "tooltip"
    }
    if (!v.startsWith("woz.")) {
      return ""
    }
    v = v.split(".").splice(1).join(".").trim()
    return v.trim()
  })
}

const parseButtonSheetRow = (keys: string[]) => {
  // object from a button sheet row with properties based on the
  // first button sheet row values

  return (values: any[]): [string, ButtonModel] | undefined => {
    const result: IButtonModel = {
      badges: {},
      id: "",
      label: "",
      tooltip: "",
      transitions: {},
    }
    values.forEach((value, index) => {
      const key = keys[index]
      if (key === undefined || value === undefined || key.length === 0) {
        return
      }
      value = value.toString().trim()
      if (key === "transitions" || key === "transition") {
        if (value !== "") {
          result.transitions._any = value
        }
        return
      }
      if (key.startsWith("badge.")) {
        result.badges[pathExtension(key)] = value
        return
      }
      result[key] = value
    })

    if (result.id === "") {
      return undefined
    }
    const button = new ButtonModel(result)
    return [button.id, button]
  }
}

const _trim = (s?: string): string => {
  return s === undefined ? "" : s.trim()
}

// the row and column arrays can be sparse!

const parseRowSheetRow = (values?: any[]): [string, RowModel] | undefined => {
  if (values === undefined || values.length < 2 || values[0] === undefined
      || values[1] === undefined) {
    return undefined
  }
  const model = new RowModel({
    buttons: arrayMap(values.slice(2), _trim),
    id: _trim(values[0]),
    label: _trim(values[1]),
  })
  return [model.id, model]
}

const parseScreenSheetColumn = (
    values?: any[]): [string, ScreenModel] | undefined => {
  if (values === undefined || values.length < 2 || values[0] === undefined
      || values[1] === undefined) {
    return undefined
  }
  const model = new ScreenModel({
    id: _trim(values[0]),
    label: _trim(values[1]),
    rows: arrayMap(values.slice(2), _trim),
  })
  return [model.id, model]
}

export const loadWozData = async (
    values: SpreadsheetValuesCallback,
    sheets: IWozSheets,
    options: IWozLoadOptions): Promise<IWozContent> => {

  const asyncValues = async (
      sheetName: string, dimension: SpreadsheetDimension) =>
      await values(sheetName, dimension)

  const asyncAllValues = async (
      sheetNames: string[], dimension: SpreadsheetDimension) =>
      (await Promise.all(
          arrayMap(
              sheetNames,
              (sheetName) =>
                  asyncValues(sheetName, dimension)))).flat()

  const buttonRowValues = await asyncAllValues(
      sheets.buttons, SpreadsheetDimension.ROW)

  const keys = extractKeys(buttonRowValues)

  const idIndex = keys.findIndex((x) => x === "id")
  if (idIndex === undefined) {
    throw new Error("no_id_attribute_in_button_sheet")
  }

  const buttons = objectFromArray(
      arrayCompactMap(buttonRowValues.slice(1), parseButtonSheetRow(keys)))

  const rowRowValues = await asyncAllValues(
          sheets.rows, SpreadsheetDimension.ROW)

  const sheetColumnsValues = await asyncAllValues(
          sheets.screens, SpreadsheetDimension.COLUMN)

  const rows = objectFromArray(arrayCompactMap(rowRowValues, parseRowSheetRow))

  const screens =
      sheetColumnsValues.length === 0
      ? {
            [sheets.name]: new ScreenModel({
              id: sheets.name,
              label: sheets.name,
              rows: Object.keys(rows),
            }),
          }
      : objectFromArray(arrayCompactMap(
          sheetColumnsValues, parseScreenSheetColumn))

  let result = {
    buttons,
    rows,
    screens,
  }

  if (options.generateTabs) {
    result = generateScreenTabs(result)
  }

  return result
}

export const parseIndexedColors = (
    rows: any[][]): { [s: string]: ColorModel } | undefined => {
  const keys = objectFromArray(arrayMap(rows[0] ? rows[0] : [],
      (value: any, index: number): [string, number] => {
        return [
          value === undefined ? "" : value.toString().trim()
                                          .toLocaleLowerCase(), index,
        ]
      }))

  if (keys.id !== undefined
      && keys.hue !== undefined
      && keys.saturation !== undefined
      && keys.brightness !== undefined) {

    const _asNumber = (x: any): number | undefined => {
      if (x === undefined || x === null) {
        return undefined
      }
      if (typeof x === "number") {
        return x
      }
      const y = Number(x)
      return isNaN(y) ? undefined : y
    }

    return objectFromArray(arrayCompactMap(rows.slice(1),
        (row: any): [string, ColorModel] | undefined => {
          // for each row
          if (row === undefined) {
            return undefined
          }

          const id = row[keys.id]
          const hue = _asNumber(row[keys.hue])
          const saturation = _asNumber(row[keys.saturation])
          const lightness = _asNumber(row[keys.brightness])

          if (id === undefined) {
            return undefined
          }

          return [
            id, ColorModel.fromHSL({
              hue,
              lightness,
              saturation,
            }),
          ]
        }))
  }

  return undefined
}
