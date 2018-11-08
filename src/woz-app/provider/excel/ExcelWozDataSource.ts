/*
 * Copyright 2018. University of Southern California
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import * as XLS from "xlsx"
import {arrayMap, objectFromArray} from "../../../common/util"
import {IWozCollectionModel, IWozDataSource} from "../../../woz/model/Model"
import {WozModel} from "../../../woz/model/WozModel"
import {IWozSheets, loadWozData, parseIndexedColors, sheetsFromNameArray, SpreadsheetDimension} from "../SheetUtils"

// noinspection JSUnusedGlobalSymbols
export class ExcelWozDataSource implements IWozDataSource {
  public readonly lastAccess: Date
  private readonly file: File

  constructor(file: File) {
    this.file = file
    this.lastAccess = new Date()
  }

  public get id(): string {
    return this.file.name
  }

  public get title(): string {
    return this.file.name
  }

  // noinspection JSUnusedGlobalSymbols
  public loadWozCollection = (): Promise<IWozCollectionModel> => {
    return loadWozCollection(this.file)
  }

  // noinspection JSUnusedLocalSymbols, JSUnusedGlobalSymbols
  public isEqual = (other?: IWozDataSource): boolean => {
    return this === other
  }
}

const spreadsheetWithFile = (file: File) => {
  return new Promise<{ workbook: XLS.WorkBook; title: string; }>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const workbook = XLS.read(reader.result, {type: "binary"})
      resolve({workbook, title: file.name})
    }

    reader.onerror = reject

    reader.readAsBinaryString(file)
  })
}

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
      if (value === undefined) { return }
      if (columns[columnIndex] === undefined) {
        columns[columnIndex] = []
      }
      columns[columnIndex][rowIndex] = value
    })
  })

  return columns
}

const loadWozCollection = async (file: File): Promise<IWozCollectionModel> => {
  const workbookAndTitle = await spreadsheetWithFile(file)

  const colors = workbookAndTitle.workbook.Sheets.colors === null ? {}
      : parseIndexedColors(await values(
          workbookAndTitle.workbook, "colors", SpreadsheetDimension.ROW))

  const sheetsToParse = sheetsFromNameArray(workbookAndTitle.workbook.SheetNames, workbookAndTitle.title)

  return {
    title: file.name,
    wozs: objectFromArray(arrayMap(
        sheetsToParse, (s: IWozSheets): [string, WozModel] => {
          return [
            s.name,
            new WozModel({
              colors: colors === undefined ? {} : colors,
              contentLoader: () => {
                return loadWozData((sheetName: string, dimension: SpreadsheetDimension) => {
                  return values(workbookAndTitle.workbook, sheetName, dimension)
                }, s)
              },
              id: s.name,
            }),
          ]
        })),
  }
}

// private static cell_as_string = (object, address: XLS.CellAddress, blank_value: string): string => {
//   const cell_address = XLS.utils.encode_cell(address);
//   let value = object[cell_address];
//   if (value === undefined) {
//     return undefined;
//   }
//   value = value.w;
//   if (value === undefined) {
//     return undefined;
//   }
//   if (value == "") {
//     return arguments.length > 1 ? blank_value : "";
//   }
//   return value;
// }
//
// private static cell_as_number = (object, address: XLS.CellAddress) => {
//   const cell_address = XLS.utils.encode_cell(address);
//   let value = object[cell_address];
//   if (value === undefined) {
//     return undefined;
//   }
//   value = value.w;
//   if (value === undefined) {
//     return undefined;
//   }
//   if (value === "") {
//     return undefined;
//   }
//   value = Number(value);
//   if (isNaN(value)) {
//     return undefined;
//   }
//   return value;
// }
//
// private static find_or_make_object_with_id = (inObject: {[s: string]: object}, id: string) => {
//   if (id === undefined) {
//     return undefined;
//   }
//
//   let object = inObject[id];
//   if (object === undefined) {
//     object = {};
//     inObject[id] = object;
//   }
//
//   return object;
// }
//
// private static find_object_with_id = (inObject, id) => {
//   if (id === undefined) {
//     return undefined;
//   }
//   return inObject[id];
// }
//
// private readonly usingHeaderRow: boolean;
//
// constructor(usingHeaderRow: boolean) {
//   this.usingHeaderRow = usingHeaderRow;
// }
//
// public convert_workbook_to_json = (workbook) => {
//   let model = {colors: {}, buttons: {}, rows: {}, screens: {}};
//   model = this._read_colors_from_sheet(model, workbook.Sheets["colors"]);
//   model = this._read_buttons_from_sheet(model, workbook.Sheets["buttons"]);
//   model = this._read_rows_from_sheet(model, workbook.Sheets["rows"]);
//   model = this._read_screens_from_sheet(model, workbook.Sheets["screens"]);
//   return model;
// }
//
// private _read_button_indexes_from_sheet = (sheet, range, R) => {
//   this.buttonIndexes = {};
//   this.idColumnIndex = -1;
//   for (let C = range.s.c; C <= range.e.c; ++C) {
//     let value = ExcelReader.cell_as_string(sheet, {c: C, r: R});
//     if (value == undefined) {
//       continue;
//     }
//     value = value.toLowerCase();
//     if (value === "answer") {
//       value = 'woz.tooltip';
//     }
//     if (!value.startsWith('woz.')) {
//       continue;
//     }
//     value = value.substring('woz.'.length);
//     this.buttonIndexes[C] = value;
//     if (value == 'id') {
//       this.idColumnIndex = C;
//     }
//   }
// }
//
// private _read_button_from_row = (model, sheet, range, R) => {
//   const button = ExcelReader.find_or_make_object_with_id(
//       model.buttons, ExcelReader.cell_as_string(sheet, {
//     c: this.idColumnIndex,
//     r: R
//   }, undefined));
//   if (button == undefined) {
//     return model;
//   }
//
//   button.label = "";
//   button.tooltip = "";
//
//   for (let C = range.s.c; C <= range.e.c; ++C) {
//     const content = ExcelReader.cell_as_string(sheet, {c: C, r: R});
//     if (content == undefined) {
//       continue;
//     }
//     const key = this.buttonIndexes[C];
//     if (key == undefined || key == 'id') {
//       continue;
//     }
//
//     if (key == 'transition') {
//       if (button.transitions === undefined) {
//         button.transitions = {};
//       }
//       button.transitions["_any"] = content;
//     } else if (key.startsWith("badge.")) {
//       if (button.badges === undefined) {
//         button.badges = {};
//       }
//       button.badges[key.substring("badge.".length)] = content;
//     } else {
//       button[key] = content;
//     }
//   }
//
//   return model;
// }
//
// private _read_buttons_from_sheet = (model, sheet) => {
//   if (sheet === undefined) {
//     return model;
//   }
//
//   const range = XLS.utils.decode_range(sheet['!ref']);
//   for (let R = range.s.r; R <= range.e.r; ++R) {
//     if (R == range.s.r && this.usingHeaderRow) {
//       this._read_button_indexes_from_sheet(sheet, range, R);
//     } else {
//       model = this._read_button_from_row(model, sheet, range, R);
//     }
//   }
//
//   return model;
// }
//
// private _read_rows_from_sheet = (model, sheet) => {
//   if (sheet === undefined) {
//     return model;
//   }
//
//   const range = XLS.utils.decode_range(sheet['!ref']);
//   for (let R = range.s.r; R <= range.e.r; ++R) {
//     let theColumn = null;
//     for (let C = range.s.c; C <= range.e.c; ++C) {
//       const content = ExcelReader.cell_as_string(sheet, {c: C, r: R});
//
//       if (C - range.s.c == 0) {
//         theColumn = ExcelReader.find_or_make_object_with_id(model.rows, content);
//         if (theColumn == undefined) {
//           break;
//         }
//         theColumn.label = "";
//         theColumn.buttons = [];
//       } else if (C - range.s.c == 1) {
//         theColumn.label = content !== undefined ? content : "";
//       } else {
//         const theButton = ExcelReader.find_object_with_id(model.buttons, content);
//         if (theButton == undefined) {
//           continue;
//         }
//         theColumn.buttons.push(content);
//       }
//
//     }
//   }
//
//   return model;
// }
//
// private _read_screens_from_sheet = (model, sheet) => {
//   if (sheet === undefined) {
//     return model;
//   }
//
//   const allStates = {};
//   const range = XLS.utils.decode_range(sheet["!ref"]);
//
//   for (let R = range.s.r; R <= range.e.r; ++R) {
//     for (let C = range.s.c; C <= range.e.c; ++C) {
//       const content = ExcelReader.cell_as_string(sheet, {c: C, r: R});
//       let theState;
//       if (R - range.s.r === 0) {
//         theState = ExcelReader.find_or_make_object_with_id(model.screens, content);
//         if (theState === undefined) {
//           continue;
//         }
//         theState.label = "";
//         theState.rows = [];
//         allStates[C] = theState;
//       } else {
//         theState = allStates[C];
//         if (theState === undefined) {
//           continue;
//         }
//         if (R - range.s.r === 1) {
//           theState.label = content;
//         } else {
//           const theColumn = ExcelReader.find_object_with_id(model.rows, content);
//           if (theColumn === undefined) {
//             continue;
//           }
//           theState.rows.push(content);
//         }
//       }
//     }
//   }
//
//   return model;
// }
//
// private _read_colors_from_sheet = (model, sheet) => {
//
//   const _get_color_components = (sheet, R, columnIndexes) => {
//     if (arguments.length != 6) {
//       return undefined;
//     }
//     const comp = [];
//     for (let i = 0; i < 3; ++i) {
//       const ci = columnIndexes[arguments[3 + i]];
//       if (ci === undefined) {
//         return undefined;
//       }
//       const value = ExcelReader.cell_as_number(sheet, {c: ci, r: R});
//       if (value === undefined) {
//         return undefined;
//       }
//       comp[i] = value;
//     }
//     return comp;
//   };
//
//   const _hsb2rgb = (comp) => {
//     if (comp == undefined) {
//       return undefined;
//     }
//
//     if (comp[1] == 0) {
//       return [comp[2], comp[2], comp[2]];
//     }
//
//     const hue2rgb = hue2rgb(p, q, t);
//   =>
//     {
//       if (t < 0) t += 1;
//       if (t > 1) t -= 1;
//       if (t < 1 / 6) return p + (q - p) * 6 * t;
//       if (t < 1 / 2) return q;
//       if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
//       return p;
//     }
//     ;
//
//     var q = comp[2] < 0.5 ? comp[2] * (1 + comp[1]) : comp[2] + comp[1] - comp[2] * comp[1];
//     var p = 2 * comp[2] - q;
//     return [hue2rgb(p, q, comp[0] + 1 / 3), hue2rgb(p, q, comp[0]), hue2rgb(p, q, comp[0] - 1 / 3)];
//   };
//
//   const _rgb_from_number = (n);
//   {
//     if (n < 0) return 0;
//     if (n > 1) return n;
//     return Math.min(Math.floor(255 * n), 255);
//   };
//
//   const _set_color_components = (theColor, comp) => {
//     theColor.r = _rgb_from_number(comp[0]);
//     theColor.g = _rgb_from_number(comp[1]);
//     theColor.b = _rgb_from_number(comp[2]);
//     return theColor;
//   };
//
//   if (sheet === undefined) {
//     return model;
//   }
//
//   const range = XLS.utils.decode_range(sheet['!ref']);
//   var columnIndexes = {};
//   let useRGB = false;
//
//   for (var R = range.s.r; R <= range.e.r; ++R) {
//     if (R == range.s.r) {
//       for (let C = range.s.c; C <= range.e.c; ++C) {
//         let content = ExcelReader.cell_as_string(sheet, {c: C, r: R});
//         if (content == undefined) {
//           continue;
//         }
//         content = content.substring(0, 1).toLowerCase();
//         columnIndexes[content] = C;
//       }
//       if (columnIndexes["h"] !== undefined && columnIndexes["s"] !== undefined && columnIndexes["b"] !== undefined
// && columnIndexes["i"] !== undefined) { useRGB = false; } else if (columnIndexes["r"] !== undefined &&
// columnIndexes["g"] !== undefined && columnIndexes["b"] !== undefined && columnIndexes["i"] !== undefined) { useRGB
// = true; } else { return model; } } else { const index = ExcelReader.cell_as_string(sheet, {c: columnIndexes.i, r:
// R}, undefined); if (index == undefined) { continue; }  var comp;  if (useRGB) { comp =
// _get_color_components(sheet, R, columnIndexes, "r", "g", "b"); } else { comp = _get_color_components(sheet, R,
// columnIndexes, "h", "s", "b"); comp = _hsb2rgb(comp); }  if (comp == undefined) { continue; }  var theColor =
// ExcelReader.find_or_make_object_with_id(model.colors, index); if (theColor == undefined) { continue; }  theColor =
// _set_color_components(theColor, comp); } }  return model; }



