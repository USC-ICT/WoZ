import {ButtonModel} from "../model/ButtonModel";
import {ColorModel} from "../model/ColorModel";
import * as Model from "../model/Model";
import {RowModel} from "../model/RowModel";
import {ScreenModel} from "../model/ScreenModel";
import {IWozContent, WozModel} from "../model/WozModel";
import {
  arrayCompactMap,
  arrayMap,
  objectFromArray,
  pathExtension,
  removingPathExtension,
  safe,
} from "../util";
import {Spreadsheet} from "./GoogleSheet";

// "project_id":"vivid-cache-219919"
// noinspection SpellCheckingInspection
const CLIENT_ID = "525650522819-5hs8fbqp0an3rqg6cnv2fbb57iuskhvc.apps.googleusercontent.com";

// // Array of API discovery doc URLs for APIs used by the quickstart
// // noinspection SpellCheckingInspection
// const DISCOVERY_DOCS =
// ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";


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

interface IWozSheets {
  readonly buttons: string;
  readonly rows: string;
  readonly screens?: string;
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

    const spreadsheet = await Spreadsheet.spreadsheetWithID(spreadsheetID);

    const colors = !spreadsheet.sheets.has("colors") ? {} :
        this._parseColors(await spreadsheet.gridData("colors"));

    const buttonSheetIDs = Array.from(spreadsheet.sheets)
        .filter((t) => t.endsWith(this.BUTTON_EXT))
        .map((t) => removingPathExtension(t));

    const allData = arrayCompactMap(arrayCompactMap(
        buttonSheetIDs,
        (wozID) => {
          // log.debug(k);
          return this._loadDataForWozWithName(spreadsheet, colors, wozID);
        }), (x) => x);

    return objectFromArray(arrayCompactMap(
        allData, (s: WozModel): [string, WozModel] => [s.id, s]));
  }

  private _parseColors = (data: gapi.client.sheets.Spreadsheet)
      : { [s: string]: ColorModel } => {

    const rowData = safe(() => data.sheets![0].data![0].rowData);
    if (rowData === undefined) {
      return {};
    }

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

  private _loadWozDataFromSheets = async (
      spreadsheet: Spreadsheet,
      sheets: IWozSheets)
      : Promise<IWozContent> => {

    const buttonRowValues = await spreadsheet.values(sheets.buttons);

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
      throw new Error("no_id_attribute_in_button_sheet");
    }

    const rowRowValues = await spreadsheet.values(sheets.rows);
    const sheetColumnsValues = await spreadsheet.values(sheets.screens, "COLUMNS");

    // a dictionary of buttons indexed by the button id
    const buttons = objectFromArray(
        arrayCompactMap(buttonRowValues.slice(1), this._parseButtonSheetRow(keys)));

    // log.debug(buttons);

    const rows = objectFromArray(arrayCompactMap(
        rowRowValues, this._parseRowSheetRow));

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
            sheetColumnsValues, this._parseScreenSheetColumn));

    // log.debug(rows);

    return {
      buttons,
      rows,
      screens,
    };
  }

  private _parseButtonSheetRow = (keys: string[]) => {
    // object from a button sheet row with properties based on the
    // first button sheet row values

    return (values: any[]): [string, ButtonModel] | undefined => {
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
  }

  private _parseRowSheetRow = (values: any[]): [string, RowModel] | undefined => {
    if (values.length < 2) {
      return undefined;
    }
    const model = new RowModel({
      buttons: arrayMap(values.slice(2), (s) => s.trim()),
      id: values[0].trim(),
      label: values[1].trim(),
    });
    return [model.id, model];
  }

  private _parseScreenSheetColumn = (values: any[]): [string, ScreenModel] | undefined => {
    if (values.length < 2) {
      return undefined;
    }
    const model = new ScreenModel({
      id: values[0].trim(),
      label: values[1].trim(),
      rows: arrayMap(values.slice(2), (s) => s.trim()),
    });
    return [model.id, model];
  }

  private _loadDataForWozWithName = (
      spreadsheet: Spreadsheet,
      colors: { [s: string]: ColorModel },
      name: string)
      : WozModel | undefined => {

    const _screenSheetName = name + this.SCREENS_EXT;

    const sheets: IWozSheets = {
      buttons: name + this.BUTTON_EXT,
      rows: name + this.ROW_EXT,
      screens: (!spreadsheet.sheets.has(_screenSheetName))
          ? undefined : _screenSheetName,
    };

    if (!spreadsheet.sheets.has(sheets.buttons)) {
      return undefined;
    }

    if (!spreadsheet.sheets.has(sheets.rows)) {
      return undefined;
    }

    return new WozModel({
      colors,
      contentLoader: () => {
        return this._loadWozDataFromSheets(spreadsheet, sheets);
      },
      id: name,
    });
  }
}
