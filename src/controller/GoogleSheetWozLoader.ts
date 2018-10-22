import {ButtonModel} from "../model/ButtonModel";
import {ColorModel} from "../model/ColorModel";
import * as Model from "../model/Model";
import {RowModel} from "../model/RowModel";
import {ScreenModel} from "../model/ScreenModel";
import {WozModel} from "../model/WozModel";
import * as util from "../util";
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
        Object.assign({}, ...util.compactMap(
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

    const BUTTON_EXT = ".buttons";
    const ROW_EXT = ".rows";
    const SCREENS_EXT = ".screens";

    const buttonSheetIDs = Object.keys(sheets)
        .filter((t) => t.endsWith(BUTTON_EXT))
        .map((t) => util.removingFileExtension(t));

    const allData = util.compactMap(await Promise.all(util.compactMap(
        buttonSheetIDs,
        (wozID) => {
          // log.debug(k);
          const buttonSheet = sheets[wozID + BUTTON_EXT];
          const rowSheet = sheets[wozID + ROW_EXT];
          const screenSheet = sheets[wozID + SCREENS_EXT];
          if (buttonSheet === undefined || rowSheet === undefined) {
            return undefined;
          }
          return this.loadDataForSetWithName(
              spreadsheetID, colors, wozID, buttonSheet, rowSheet, screenSheet);
        })), (x) => x);

    return Object.assign(
        {},
        ...util.compactMap(allData, (s: WozModel) => ({[s.id]: s})));
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

    return Object.assign({}, ...data.sheets[0].data[0].rowData
        .map((row): Array<{ [s: string]: ColorModel }> => {
          // for each row
          if (row === undefined || row.values === undefined) {
            return [];
          }
          return util.compactMap(
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

  private loadDataForSetWithName = async (
      spreadsheetID: string,
      colors: { [s: string]: ColorModel },
      name: string,
      buttonSheet: gapi.client.sheets.Sheet,
      rowSheet: gapi.client.sheets.Sheet,
      screenSheet: gapi.client.sheets.Sheet | undefined)
      : Promise<WozModel | undefined> => {

    if (buttonSheet.properties === undefined
        || buttonSheet.properties.title === undefined
        || rowSheet.properties === undefined
        || rowSheet.properties.title === undefined) {
      return undefined;
    }

    const buttonRows = await spreadsheetValues(
        spreadsheetID, buttonSheet.properties.title);
    const rowRows = await spreadsheetValues(
        spreadsheetID, rowSheet.properties.title);
    const sheetColumns =
        screenSheet === undefined
        || screenSheet.properties === undefined
        || screenSheet.properties.title === undefined
            ? undefined
            : await spreadsheetValues(
            spreadsheetID, screenSheet.properties.title, "COLUMNS");

    if (buttonRows.result === undefined
        || buttonRows.result.values === undefined
        || rowRows.result === undefined
        || rowRows.result.values === undefined) {
      return undefined;
    }

    // log.debug(buttonRows);

    const keys = buttonRows.result.values[0].map((v: string): string => {
      v = v.trim();
      if (!v.startsWith("woz.")) {
        return "";
      }
      v = v.split(".").splice(1).join(".").trim();
      return v.trim();
    });

    const idIndex = keys.findIndex((x) => x === "id");
    if (idIndex === undefined) {
      return undefined;
    }

    const parseGoodButtonSheetRow = (v: any, i: number) => {
      const key = keys[i];
      if (key === undefined
          || key.length === 0
          || v === undefined) {
        return undefined;
      }
      const value = v.toString().trim();
      if (value === "") {
        return undefined;
      }
      return ({[key]: value});
    };

    const parseButtonSheetRow = (values: any[]): { [s: string]: ButtonModel } | undefined => {
      // object from a button sheet row with properties based on the
      // first button sheet row values
      const id = values[idIndex];
      if (id === undefined) {
        return undefined;
      }
      return ({
        [id]: Object.assign(new ButtonModel(id),
            ...util.compactMap(values, parseGoodButtonSheetRow)),
      });
    };

    const parseRowSheetRow = (values: any[]): { [s: string]: RowModel } | undefined => {
      if (values === undefined || values.length < 2) {
        return undefined;
      }
      const model = new RowModel(values[0], values[1], values.slice(2));
      return ({[model.id]: model});
    };

    const parseScreenSheetColumn = (values: any[]): { [s: string]: ScreenModel } | undefined => {
      if (values === undefined || values.length < 2) {
        return undefined;
      }
      const model = new ScreenModel(values[0], values[1], values.slice(2));
      return ({[model.id]: model});
    };

    // a dictionary of buttons indexed by the button id
    const buttons = Object.assign({},
        ...util.compactMap(buttonRows.result.values.slice(1), parseButtonSheetRow));

    // log.debug(buttons);

    const rows = Object.assign({},
        ...util.compactMap(rowRows.result.values, parseRowSheetRow));

    const screens =
        sheetColumns === undefined
        || sheetColumns.result === undefined
        || sheetColumns.result.values === undefined
            ? {[name]: new ScreenModel(name, name, Object.keys(rows))}
            : Object.assign({},
            ...util.compactMap(sheetColumns.result.values, parseScreenSheetColumn));

    // log.debug(rows);

    return new WozModel({
      buttons,
      colors,
      id: name,
      rows,
      screens,
    });
  }
}
