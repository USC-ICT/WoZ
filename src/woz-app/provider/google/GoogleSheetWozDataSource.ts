import {log} from "../../../common/Logger";
import {arrayCompactMap, arrayMap, objectFromArray, safe} from "../../../common/util";
import {ColorModel} from "../../../woz/model/ColorModel";
import * as Model from "../../../woz/model/Model";
import {IWozCollectionModel, IWozDataSource} from "../../../woz/model/Model";
import {WozModel} from "../../../woz/model/WozModel";
import {Store} from "../../Store";
import {loadWozData, parseIndexedColors, sheetsFromNameArray, SpreadsheetDimension} from "../SheetUtils";
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
    script.src = "https://apis.google.com/js/api.js";
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
      log.debug("immediate_failed", result);
      if (result === "immediate_failed") {
        log.debug("try again", result);
        auth(false, resolve, reject);
      } else {
        log.debug("will reject", result);
        reject(result);
      }
    });
  });
}

export class GoogleSheetWozDataSource implements IWozDataSource {
  public readonly id: string;
  public title: string;
  public lastAccess: Date;

  constructor(spreadsheetID: string, title: string, lastAccess: Date) {
    this.id = spreadsheetID;
    this.title = title;
    this.lastAccess = lastAccess;
  }

  // noinspection JSUnusedGlobalSymbols
  public loadWozCollection = (): Promise<IWozCollectionModel> => {
    return loadDataFromSpreadsheet(this.id)
        .then((data) => {
          this.title = data.title;
          const stored = Store.shared.knownSpreadsheets;
          stored[this.id] = {title: this.title, lastAccess: new Date()};
          Store.shared.knownSpreadsheets = stored;
          return data;
        });
  }

  // noinspection JSUnusedGlobalSymbols
  public isEqual = (other?: IWozDataSource): boolean => {
    return other !== undefined && other instanceof GoogleSheetWozDataSource
        ? other.id === this.id : false;
  }
}

// noinspection SpellCheckingInspection
let _gapiPromise: Promise<any>;

const loadDataFromSpreadsheet = async (spreadsheetID: string)
    : Promise<Model.IWozCollectionModel> => {
  await gapiPromise();

  const spreadsheet = await Spreadsheet.spreadsheetWithID(spreadsheetID);

  const colors = !spreadsheet.sheets.has("colors") ? {} :
      _parseColors(await spreadsheet.gridData("colors"));

  const sheetsToParse = sheetsFromNameArray(Array.from(spreadsheet.sheets), spreadsheet.title);

  return {
    title: spreadsheet.title,
    wozs: objectFromArray(arrayCompactMap(
        sheetsToParse,
        (sheets): [string, WozModel] => {
          // log.debug(k);
          return [sheets.name, new WozModel({
            colors,
            contentLoader: () => {
              return loadWozData((sheetName: string, dimension: SpreadsheetDimension) => {
                return spreadsheet.values(
                    sheetName,
                    dimension === SpreadsheetDimension.ROW ? "ROWS" : "COLUMNS");
              }, sheets);
            },
            id: sheets.name,
          })];
        })),
  };
};

const gapiPromise = (): Promise<any> => {
  if (_gapiPromise === undefined) {
    _gapiPromise = loadSheets();
  }
  return _gapiPromise;
};

const _parseColors = (data: gapi.client.sheets.Spreadsheet)
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

  const justData = arrayCompactMap(rowData, (row): any[] | undefined => {
    if (row.values === undefined) {
      return undefined;
    }
    return arrayMap(row.values, (cd) => {
      return cd.formattedValue;
    });
  });

  const indexedColors = parseIndexedColors(justData);
  if (indexedColors !== undefined) {
    return indexedColors;
  }

  return objectFromArray(arrayMap(rowData,
      (row: gapi.client.sheets.RowData): Array<[string, ColorModel]> => {
        // for each row
        return arrayCompactMap(row.values ? row.values : [], indexedColorOrUndefined);
      }).flat());
};

