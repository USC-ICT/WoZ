import {
  arrayCompactMap,
  arrayMap,
  objectFromArray,
  pathExtension,
  removingPathExtension,
  safe,
} from "../common/util";
import {ButtonModel, IButtonModel} from "../woz/model/ButtonModel";
import {ColorModel} from "../woz/model/ColorModel";
import * as Model from "../woz/model/Model";
import {RowModel} from "../woz/model/RowModel";
import {ScreenModel} from "../woz/model/ScreenModel";
import {IWozContent, WozModel} from "../woz/model/WozModel";
import {Spreadsheet} from "./GoogleSheet";
import {Store} from "./Store";

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
    script.type = "text/javascript";
    script.charset = "utf-8";
    script.onload = () => resolve(gapi);
    document.head!.appendChild(script);
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
      reject: (x: any) => void) => {
    gapi.auth.authorize({
      client_id: CLIENT_ID,
      immediate,
      scope: [SCOPES],
    }, (result) => {
      if (result && !result.error) {
        resolve(result);
      } else {
        reject(result.error);
      }
    });
  };

  await new Promise((resolve, reject) => {
    auth(true, resolve, (result) => {
      if (result === "immediate_failed") {
        auth(false, resolve, reject);
      } else {
        reject(result);
      }
    });
  });
}

interface IWozSheets {
  readonly buttons: string;
  readonly name: string;
  readonly rows: string;
  readonly screens?: string;
}

export class GoogleSheetWozLoader {
  public static shared: GoogleSheetWozLoader = new GoogleSheetWozLoader();

  // noinspection SpellCheckingInspection
  private _gapiPromise?: Promise<any>;

  private readonly BUTTON_EXT = ".buttons";
  private readonly ROW_EXT = ".rows";
  private readonly SCREENS_EXT = ".screens";

  public loadDataFromSpreadsheet = async (spreadsheetID: string)
      : Promise<Model.IWozCollectionModel> => {
    await this.gapiPromise();

    const spreadsheet = await Spreadsheet.spreadsheetWithID(spreadsheetID);

    const colors = !spreadsheet.sheets.has("colors") ? {} :
        this._parseColors(await spreadsheet.gridData("colors"));

    const buttonSheetIDs = Array.from(spreadsheet.sheets)
        .filter((t) => t.endsWith(this.BUTTON_EXT))
        .map((t) => removingPathExtension(t));

    const allData = arrayCompactMap(
        buttonSheetIDs,
        (wozID) => {
          // log.debug(k);
          return this._loadDataForWozWithName(spreadsheet, colors, wozID);
        });

    const stored = Store.shared.knownSpreadsheets;
    stored[spreadsheet.id] = {title: spreadsheet.title};
    Store.shared.knownSpreadsheets = stored;

    return objectFromArray(arrayCompactMap(
        allData, (s: WozModel): [string, WozModel] => [s.id, s]));
  }

  private gapiPromise = (): Promise<any> => {
    if (this._gapiPromise === undefined) {
      this._gapiPromise = loadSheets();
    }
    return this._gapiPromise;
  }

  private _parseColors = (data: gapi.client.sheets.Spreadsheet)
      : { [s: string]: ColorModel } => {

    const rowData = safe(() => data.sheets![0].data![0].rowData);
    if (rowData === undefined || rowData.length === 0) {
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
      const color = ColorModel.fromRGB(backgroundColor);
      // ignore white
      return color.isWhite ? undefined : [stringValue, color];
    };

    const keys = objectFromArray(arrayMap(rowData[0].values ? rowData[0].values : [],
        (value: gapi.client.sheets.CellData, index: number): [string, number] => {
          const stringValue = safe(() => value.effectiveValue!.stringValue);
          return [stringValue === undefined ? "" : stringValue.trim().toLocaleLowerCase(), index];
        }));

    if (keys.id !== undefined
        && keys.hue !== undefined
        && keys.saturation !== undefined
        && keys.brightness !== undefined) {

      return objectFromArray(arrayCompactMap(rowData.slice(1),
          (row: gapi.client.sheets.RowData): [string, ColorModel] | undefined => {
            // for each row
            if (row.values === undefined) {
              return undefined;
            }

            const id = safe(() => row.values![keys.id].effectiveValue!.stringValue);
            const hue = safe(() => row.values![keys.hue].effectiveValue!.numberValue);
            const saturation = safe(() => row.values![keys.saturation].effectiveValue!.numberValue);
            const lightness = safe(() => row.values![keys.brightness].effectiveValue!.numberValue);

            if (id === undefined) { return undefined; }

            return [id, ColorModel.fromHSL({
              hue,
              lightness,
              saturation,
            })];
          }));
    }

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
      if (v.toLocaleLowerCase() === "answer") {
        // legacy exception
        return "tooltip";
      }
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
              [sheets.name]: new ScreenModel({
                id: sheets.name,
                label: sheets.name,
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
      const result: IButtonModel = {
        badges: {},
        id: "",
        label: "",
        tooltip: "",
        transitions: {},
      };
      values.forEach((value, index) => {
        const key = keys[index];
        if (key === undefined || value === undefined || key.length === 0) {
          return;
        }
        value = value.toString().trim();
        if (key === "transitions" || key === "transition") {
          if (value !== "") {
            result.transitions._any = value;
          }
          return;
        }
        if (key.startsWith("badge.")) {
          result.badges[pathExtension(key)] = value;
          return;
        }
        result[key] = value;
      });

      if (result.id === "") {
        return undefined;
      }
      const button = new ButtonModel(result);
      return [button.id, button];
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
      name,
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
