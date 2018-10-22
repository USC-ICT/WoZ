/* eslint-disable import/first */

import {ButtonModel} from "../model/ButtonModel";
import {ColorModel} from "../model/ColorModel";
import * as Model from "../model/Model";
import {RowModel} from "../model/RowModel";
import {WozModel} from "../model/WozModel";
import * as util from "../util";
import {log} from "./Logger";

// noinspection SpellCheckingInspection
const CLIENT_ID = "525650522819-5hs8fbqp0an3rqg6cnv2fbb57iuskhvc.apps.googleusercontent.com";
// "project_id":"vivid-cache-219919"

// // noinspection SpellCheckingInspection
// const API_KEY = "AIzaSyD-j_mpMgzWZVZSjLeOTbqhVGcEX3qa5lU";
//
// // Array of API discovery doc URLs for APIs used by the quickstart
// // noinspection SpellCheckingInspection
// const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
// noinspection SpellCheckingInspection
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

function gapiSpreadsheets(): gapi.client.sheets.SpreadsheetsResource {
  /* tslint:disable */
  // there is a bug in the gapi typings, where
  // .spreadsheets property is in the gapi.client namespace instead of
  // the gapi.client.sheets namespace. So, we force it...
  return gapi.client["sheets"].spreadsheets;
  /* tslint:enable */
}

async function spreadsheetWithID(ID) {
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

async function spreadsheetValues(spreadsheetID, sheet) {
  return gapiSpreadsheets().values.get({
    range: sheet,
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
    // log.debug(spreadsheet);
    const buttonSheets = {};
    const rowSheets = {};
    let colors = {};
    for (const sheet of spreadsheet.sheets) {
      const title = sheet.properties.title;
      if (title.endsWith(".buttons")) {
        buttonSheets[util.removingFileExtension(title)] = sheet;
      }
      if (title.endsWith(".rows")) {
        rowSheets[util.removingFileExtension(title)] = sheet;
      }
      if (title === "colors") {
        const response = await gapiSpreadsheets().get({
          includeGridData: true,
          ranges: title,
          spreadsheetId: spreadsheetID,
        });
        colors = this._parseColors(response.result);
        log.debug("colors?", colors);
      }
    }

    const allData = await Promise.all(util.objectCompactMap(buttonSheets,
        ([k, v]) => {
          // log.debug(k);
          return rowSheets.hasOwnProperty(k) ? this.loadDataForSetWithName(
              spreadsheetID, colors, k, v, rowSheets[k]) : undefined;
        }));

    return Object.assign({}, ...allData
        .map((s: WozModel) => ({[s.id]: s})));
  }

  private _parseColors = (data: gapi.client.sheets.Spreadsheet): {[s: string]: ColorModel} => {
    try {
      return Object.assign({}, ...data.sheets[0].data[0].rowData
          .map((row): Array<{[s: string]: ColorModel}> => {
        try {
          // for each row
          return util.compactMap(row.values, (value): {[s: string]: ColorModel} => {
            try {
              // for each cell in row, try to extract the background color
              const color = new ColorModel(value.effectiveFormat.backgroundColor);
              // ignore white
              return color.isWhite ? undefined : {[value.effectiveValue.stringValue]: color};
            } catch {
              // we may fail for a cell
              return undefined;
            }
          });
        } catch {
          // we may fail for a row
          return [];
        }
      }).flat());
    } catch (e) {
      // we can fail on the whole sheet. sigh.
      return {};
    }
  }

  private loadDataForSetWithName = async (
      spreadsheetID: string,
      colors: {[s: string]: ColorModel},
      name: string,
      buttonSheet: gapi.client.sheets.Sheet,
      rowSheet: gapi.client.sheets.Sheet)
      : Promise<WozModel> => {

    const buttonRows = await spreadsheetValues(spreadsheetID, buttonSheet.properties.title);
    const rowRows = await spreadsheetValues(spreadsheetID, rowSheet.properties.title);

    // log.debug(buttonRows);

    const keys = buttonRows.result.values[0].map((v) => {
      v = v.trim();
      if (!v.startsWith("woz.")) {
        return "";
      }
      v = v.split(".").splice(1).join(".");
      return v.trim();
    });

    // a dictionary of buttons indexed by the button id
    const buttons = Object.assign({},
        ...util.compactMap(buttonRows.result.values.slice(1), (values) => {
          // object from a button sheet row with properties based on the first
          // button sheet row values
          const button: ButtonModel = Object.assign(new ButtonModel(),
              ...util.compactMap(values,
                  (v, i) => {
                    const key = keys[i];
                    if (key.length === 0) {
                      return undefined;
                    }
                    return ({[key]: v});
                  }));
          return util.defined(button.id) ? ({[button.id]: button}) : undefined;
        }));

    // log.debug(buttons);

    const rows = Object.assign({},
        ...util.compactMap(rowRows.result.values, (r) => {
          if (!util.defined(r) || r.length < 2) { return undefined; }
          const row = new RowModel(r[0], r[1], r.slice(2));
          return util.defined(row.id) ? ({[r[0]]: row}) : undefined;
        }));

    // log.debug(rows);

    const woz: WozModel = {
      allScreenIDs: [name],
      buttons,
      colors,
      id: name,
      rows,
      screens: {},
    };

    woz.screens[name] = {
      id: name,
      label: name,
      rows: Object.keys(rows),
    };

    return woz;
  }
}
