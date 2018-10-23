import {ButtonModel} from "../model/ButtonModel";
import {ColorModel} from "../model/ColorModel";
import * as Model from "../model/Model";
import {RowModel} from "../model/RowModel";
import {ScreenModel} from "../model/ScreenModel";
import {IWozContent, WozModel} from "../model/WozModel";
import {
  arrayCompactMap,
  arrayMap,
  pathExtension,
  removingPathExtension,
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

async function spreadsheetWithID(ID: string) {
  const response = await gapiSpreadsheets().get({
    spreadsheetId: ID,
  });

  log.debug(response);
  return response.result;

  // spreadsheet.sheets = spreadsheet.sheets.map((s) => {
  //   s.rowMajorValues = new Promise((resolve, reject) => {
  //     spreadsheets.values.get({
  //       range: s.properties.title,
  //       spreadsheetId: ID,
  //     }).then((r) => {
  //       resolve(JSON.parse(r.body));
  //     }, reject);
  //   });
  //   return s;
  // });
}

async function spreadsheetValues(
    spreadsheetID: string, sheetName: string, dimension?: string) {
  return gapiSpreadsheets().values.get({
    majorDimension: dimension,
    range: sheetName,
    spreadsheetId: spreadsheetID,
  });
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

  await new Promise((resolve, reject) => {
    gapi.auth.authorize({
      client_id: CLIENT_ID,
      immediate: true,
      scope: [SCOPES],
    }, (result) => {
      if (result && !result.error) {
        resolve(result);
      } else {
        reject(result);
      }
    });
  });

  // await gapi.client.init({
  //   apiKey: API_KEY,
  //   clientId: CLIENT_ID,
  //   discoveryDocs: DISCOVERY_DOCS,
  //   scope: SCOPES,
  // });

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
        Object.assign({}, ...arrayCompactMap(
            spreadsheet.sheets, (sheet) => {
              if (sheet.properties === undefined) {
                return undefined;
              }
              const title = sheet.properties.title;
              if (title === undefined) {
                return undefined;
              }
              return ({[title]: sheet});
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

    return Object.assign(
        {},
        ...arrayCompactMap(allData, (s: WozModel) => ({[s.id]: s})));
  }

  private _parseColors = (data: gapi.client.sheets.Spreadsheet)
      : { [s: string]: ColorModel } => {
    if (data.sheets === undefined
        || data.sheets[0] === undefined
        || data.sheets[0].data === undefined
        || data.sheets[0].data[0] === undefined
        || data.sheets[0].data[0].rowData === undefined) {
      return {};
    }

    return Object.assign({}, ...arrayMap(data.sheets[0].data[0].rowData,
        (row): Array<{ [s: string]: ColorModel }> => {
          // for each row
          if (row === undefined || row.values === undefined) {
            return [];
          }
          return arrayCompactMap(
              row.values,
              (value: gapi.client.sheets.CellData)
                  : { [s: string]: ColorModel } | undefined => {
                if (value.effectiveFormat === undefined
                    || value.effectiveFormat.backgroundColor === undefined
                    || value.effectiveValue === undefined
                    || value.effectiveValue.stringValue === undefined) {
                  return undefined;
                }
                // for each cell in row, try to extract the background color
                const color = new ColorModel(
                    value.effectiveFormat.backgroundColor);
                // ignore white
                return color.isWhite
                    ? undefined : {[value.effectiveValue.stringValue]: color};
              });
        }).flat());
  }

  private _loadDataForWoz = async (
      spreadsheetID: string,
      buttonSheet: string,
      rowSheet: string,
      screenSheet: string | undefined)
      : Promise<IWozContent> => {

    const buttonRows = await spreadsheetValues(spreadsheetID, buttonSheet);
    const rowRows = await spreadsheetValues(spreadsheetID, rowSheet);
    const sheetColumns =
        screenSheet === undefined
            ? undefined
            : await spreadsheetValues(
            spreadsheetID, screenSheet, "COLUMNS");

    if (buttonRows.result === undefined
        || buttonRows.result.values === undefined) {
      throw new Error("button sheet failed to load");
    }

    if (rowRows.result === undefined
        || rowRows.result.values === undefined) {
      throw new Error("row sheet failed to load");
    }

    if (screenSheet !== undefined) {
      if (sheetColumns === undefined
          || sheetColumns.result === undefined
          || sheetColumns.result.values === undefined) {
        throw new Error("screen sheet failed to load");
      }
    }
    // log.debug(buttonRows);

    const keys = arrayMap(buttonRows.result.values[0], (v: string): string => {
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

    const parseButtonSheetRow = (values: any[]): { [s: string]: ButtonModel } | undefined => {
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
      return ({[result.id]: button});
    };

    const parseRowSheetRow = (values: any[]): { [s: string]: RowModel } | undefined => {
      if (values === undefined || values.length < 2) {
        return undefined;
      }
      const model = new RowModel({
        buttons: arrayMap(values.slice(2), (s) => s.trim()),
        id: values[0].trim(),
        label: values[1].trim(),
      });
      return ({[model.id]: model});
    };

    const parseScreenSheetColumn = (values: any[]): { [s: string]: ScreenModel } | undefined => {
      if (values === undefined || values.length < 2) {
        return undefined;
      }
      const model = new ScreenModel({
        id: values[0].trim(),
        label: values[1].trim(),
        rows: arrayMap(values.slice(2), (s) => s.trim()),
      });
      return ({[model.id]: model});
    };

    // a dictionary of buttons indexed by the button id
    const buttons = Object.assign({},
        ...arrayCompactMap(buttonRows.result.values.slice(1), parseButtonSheetRow));

    // log.debug(buttons);

    const rows = Object.assign({},
        ...arrayCompactMap(rowRows.result.values, parseRowSheetRow));

    const screens =
        sheetColumns === undefined
        || sheetColumns.result === undefined
        || sheetColumns.result.values === undefined
            ? {
              [name]: new ScreenModel({
                id: name,
                label: name,
                rows: Object.keys(rows),
              }),
            }
            : Object.assign({},
            ...arrayCompactMap(sheetColumns.result.values, parseScreenSheetColumn));

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

    if (buttonSheetName === undefined || rowSheetName === undefined) {
      return undefined;
    }

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
