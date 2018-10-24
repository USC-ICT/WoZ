import {ButtonModel} from "../model/ButtonModel";
import {ColorModel} from "../model/ColorModel";
import * as Model from "../model/Model";
import {RowModel} from "../model/RowModel";
import {ScreenModel} from "../model/ScreenModel";
import {IWozContent, WozModel} from "../model/WozModel";
import {
  arrayCompactMap,
  arrayMap, objectFromArray,
  pathExtension,
  removingPathExtension, safe,
} from "../util";
import {log} from "./Logger";

// noinspection SpellCheckingInspection
const CLIENT_ID = "525650522819-5hs8fbqp0an3rqg6cnv2fbb57iuskhvc.apps.googleusercontent.com";
// "project_id":"vivid-cache-219919"

// noinspection SpellCheckingInspection
// const API_KEY = "AIzaSyD-j_mpMgzWZVZSjLeOTbqhVGcEX3qa5lU";
//
// // Array of API discovery doc URLs for APIs used by the quickstart
// // noinspection SpellCheckingInspection
// const DISCOVERY_DOCS =
// ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
// noinspection SpellCheckingInspection
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

function gapiSpreadsheets(): gapi.client.sheets.SpreadsheetsResource {
  /* tslint:disable */
  // there is a bug in the gapi typings, where
  // .spreadsheets property is in the gapi.client namespace instead of
  // the gapi.client.sheets namespace. So, we force it...
  // @ts-ignore
  return gapi.client["sheets"].spreadsheets;
  /* tslint:enable */
}

async function spreadsheetWithID(ID: string)
    : Promise<gapi.client.sheets.Spreadsheet> {
  const response = await gapiSpreadsheets().get({
    spreadsheetId: ID,
  });

  log.debug(response);
  return response.result;
}

async function spreadsheetValues(
    spreadsheetID: string, sheetName: string, dimension?: string)
    : Promise<any[][]>;
async function spreadsheetValues(
    spreadsheetID: string, sheetName?: string, dimension?: string)
    : Promise<any[][] | undefined>;
async function spreadsheetValues(
    spreadsheetID: string, sheetName?: string, dimension?: string)
      : Promise<any[][] | undefined> {
  if (sheetName === undefined) { return undefined; }
  return gapiSpreadsheets().values.get({
    majorDimension: dimension,
    range: sheetName,
    spreadsheetId: spreadsheetID,
  }).then((result) => {
        if (result.result !== undefined && result.result.values !== undefined) {
          return result.result.values;
        }
        throw new Error("Sheet \"" + sheetName + "\" values failed to load");
      },
      (error) => { throw error; });
}

async function loadSheets() {
  await new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/client.js";
    script.onload = () => resolve(gapi);
    document.body.appendChild(script);
  });

  await new Promise((resolve, reject) => {
    gapi.load("client", {
      callback: resolve,
      onerror: reject,
      ontimeout: reject,
      timeout: 1000,
    });
  });

  await gapi.client.load("sheets", "v4");

  const auth = (
      immediate: boolean,
      resolve: (x: GoogleApiOAuth2TokenObject) => void,
      reject: (x: GoogleApiOAuth2TokenObject) => void) => {
    gapi.auth.authorize({
      client_id: CLIENT_ID,
      immediate,
      scope: [SCOPES],
    }, (result) => {
      if (result && !result.error) {
        resolve(result);
      } else {
        reject(result);
      }
    });
  };

  await new Promise((resolve, reject) => {
    auth(true, resolve, (result) => {
      if (result.error === "immediate_failed") {
        auth(false, resolve, reject);
      } else {
        reject(result);
      }
    });
  });
}

export class GoogleSheetWozLoader {
  public static shared: GoogleSheetWozLoader = new GoogleSheetWozLoader();

  // noinspection SpellCheckingInspection
  private readonly gapiPromise: Promise<any>;

  private readonly BUTTON_EXT = ".buttons";
  private readonly ROW_EXT = ".rows";
  private readonly SCREENS_EXT = ".screens";

  private constructor() {
    this.gapiPromise = loadSheets();
  }

  public loadDataFromSpreadsheet = async (spreadsheetID: string)
      : Promise<Model.IWozCollectionModel> => {
    await this.gapiPromise;

    const spreadsheet = await spreadsheetWithID(spreadsheetID);
    if (spreadsheet.sheets === undefined) {
      return {};
    }
    // log.debug(spreadsheet);
    const sheets: { [s: string]: gapi.client.sheets.Sheet } =
        objectFromArray(arrayCompactMap(
            spreadsheet.sheets, (sheet)
                : [string, gapi.client.sheets.Sheet] | undefined => {
              const title = safe(() => sheet.properties!.title);
              if (title === undefined) {
                return undefined;
              }
              return [title, sheet];
            }));

    const colorSheet = sheets.colors;
    const colors = colorSheet === undefined ? {} :
        this._parseColors((await gapiSpreadsheets().get({
          includeGridData: true,
          ranges: "colors",
          spreadsheetId: spreadsheetID,
        })).result);

    const buttonSheetIDs = Object.keys(sheets)
        .filter((t) => t.endsWith(this.BUTTON_EXT))
        .map((t) => removingPathExtension(t));

    const allData = arrayCompactMap(arrayCompactMap(
        buttonSheetIDs,
        (wozID) => {
          // log.debug(k);
          return this.loadDataForSetWithName(
              spreadsheetID, colors, wozID, sheets);
        }), (x) => x);

    return objectFromArray(arrayCompactMap(
        allData, (s: WozModel): [string, WozModel] => [s.id, s]));
  }

  private _parseColors = (data: gapi.client.sheets.Spreadsheet)
      : { [s: string]: ColorModel } => {

    const rowData = safe(() => data.sheets![0].data![0].rowData);
    if (rowData === undefined) { return {}; }

    const indexedColorOrUndefined = (value: gapi.client.sheets.CellData)
        : [string, ColorModel] | undefined => {
      const backgroundColor = safe(() => value.effectiveFormat!.backgroundColor);
      const stringValue = safe(() => value.effectiveValue!.stringValue);
      if (backgroundColor === undefined || stringValue === undefined) {
        return undefined;
      }
      // for each cell in row, try to extract the background color
      const color = new ColorModel(backgroundColor);
      // ignore white
      return color.isWhite ? undefined : [stringValue, color];
    };

    return objectFromArray(arrayMap(rowData,
        (row: gapi.client.sheets.RowData): Array<[string, ColorModel]> => {
          // for each row
          return arrayCompactMap(row.values ? row.values : [], indexedColorOrUndefined);
        }).flat());
  }

  private _loadDataForWoz = async (
      spreadsheetID: string,
      buttonSheet: string,
      rowSheet: string,
      screenSheet: string | undefined)
      : Promise<IWozContent> => {

    const buttonRowValues = await spreadsheetValues(spreadsheetID, buttonSheet);

    // log.debug(buttonRows);

    const keys = arrayMap(buttonRowValues[0], (v: string): string => {
      v = v.trim();
      if (!v.startsWith("woz.")) {
        return "";
      }
      v = v.split(".").splice(1).join(".").trim();
      return v.trim();
    });

    const idIndex = keys.findIndex((x) => x === "id");
    if (idIndex === undefined) {
      throw new Error("no id attribute in the button sheet");
    }

    const rowRowValues = await spreadsheetValues(spreadsheetID, rowSheet);
    const sheetColumnsValues = await spreadsheetValues(spreadsheetID, screenSheet, "COLUMNS");

    const parseButtonSheetRow = (values: any[]): [string, ButtonModel] | undefined => {
      // object from a button sheet row with properties based on the
      // first button sheet row values
      const result1: { [index: string]: any; } = {
        badges: {},
      };
      values.forEach((value, index) => {
        const key = keys[index];
        if (key === undefined || value === undefined || key.length === 0) {
          return;
        }
        value = value.toString().trim();
        if (key === "transitions") {
          return;
        }
        if (key.startsWith("badge.")) {
          result1.badges[pathExtension(key)] = value;
          return;
        }
        result1[key] = value;
      });
      if (result1.id === undefined) {
        return undefined;
      }
      const result = result1;
      const button = new ButtonModel({
        badges: result.badges,
        color: result.color,
        id: result.id,
        imageURL: result.imageURL,
        label: result.label || "",
        tooltip: result.tooltip || "",
        transitions: {},
      });
      return [result.id, button];
    };

    const parseRowSheetRow = (values: any[]): [string, RowModel] | undefined => {
      if (values.length < 2) {
        return undefined;
      }
      const model = new RowModel({
        buttons: arrayMap(values.slice(2), (s) => s.trim()),
        id: values[0].trim(),
        label: values[1].trim(),
      });
      return [model.id, model];
    };

    const parseScreenSheetColumn = (values: any[]): [string, ScreenModel] | undefined => {
      if (values.length < 2) {
        return undefined;
      }
      const model = new ScreenModel({
        id: values[0].trim(),
        label: values[1].trim(),
        rows: arrayMap(values.slice(2), (s) => s.trim()),
      });
      return [model.id, model];
    };

    // a dictionary of buttons indexed by the button id
    const buttons = objectFromArray(
        arrayCompactMap(buttonRowValues.slice(1), parseButtonSheetRow));

    // log.debug(buttons);

    const rows = objectFromArray(arrayCompactMap(
        rowRowValues, parseRowSheetRow));

    const screens =
        sheetColumnsValues === undefined
            ? {
              [name]: new ScreenModel({
                id: name,
                label: name,
                rows: Object.keys(rows),
              }),
            }
            : objectFromArray(arrayCompactMap(
            sheetColumnsValues, parseScreenSheetColumn));

    // log.debug(rows);

    return {
      buttons,
      rows,
      screens,
    };
  }

  private loadDataForSetWithName = (
      spreadsheetID: string,
      colors: { [s: string]: ColorModel },
      name: string,
      sheets: { [s: string]: gapi.client.sheets.Sheet })
      : WozModel | undefined => {

    const buttonSheetName = name + this.BUTTON_EXT;
    if (sheets[buttonSheetName] === undefined) {
      return undefined;
    }

    const rowSheetName = name + this.ROW_EXT;
    if (sheets[rowSheetName] === undefined) {
      return undefined;
    }

    const _screenSheetName = name + this.SCREENS_EXT;
    const screenSheetName = (sheets[_screenSheetName] === undefined)
        ? undefined : _screenSheetName;

    return new WozModel({
      colors,
      contentLoader: () => {
        return this._loadDataForWoz(
            spreadsheetID,
            buttonSheetName,
            rowSheetName,
            screenSheetName);
      },
      id: name,
    });
  }
}
