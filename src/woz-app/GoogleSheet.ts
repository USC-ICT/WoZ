// noinspection SpellCheckingInspection
// noinspection SpellCheckingInspection
// noinspection SpellCheckingInspection
import {log} from "../common/Logger";
import {arrayCompactMap, safe} from "../common/util";

// noinspection SpellCheckingInspection
const API_KEY = "AIzaSyD-j_mpMgzWZVZSjLeOTbqhVGcEX3qa5lU";

function gapiSpreadsheets(): gapi.client.sheets.SpreadsheetsResource {
  /* tslint:disable */
  // there is a bug in the gapi typings, where
  // .spreadsheets property is in the gapi.client namespace instead of
  // the gapi.client.sheets namespace. So, we force it...
  // @ts-ignore
  return gapi.client["sheets"].spreadsheets;
  /* tslint:enable */
}

interface ISpreadsheetValues {
  (sheetName: string, dimension?: string): Promise<any[][]>;

  (sheetName?: string, dimension?: string): Promise<any[][] | undefined>;
}

interface ISpreadsheetProperties {
  readonly sheets: Set<string>;
  readonly title: string;
  readonly id: string;
}

async function gapiPromise<T>(promise: gapi.client.Request<T>): Promise<T> {
  return promise.then(
      (response) => response.result,
      (response) => {
        throw response.result.error;
      });
}

export class Spreadsheet {
  public static spreadsheetWithID = async (ID: string)
      : Promise<Spreadsheet> => {

    const gapiSpreadsheet = await gapiPromise(gapiSpreadsheets().get({
      // fields: "sheets",
      key: API_KEY,
      spreadsheetId: ID,
    }));

    log.debug(gapiSpreadsheet);

    if (gapiSpreadsheet === undefined || gapiSpreadsheet.sheets === undefined) {
      throw new Error("failed_to_load_sheets");
    }

    const sheets = new Set(arrayCompactMap(
        gapiSpreadsheet.sheets, (sheet)
            : string | undefined => {
          const sheetTitle = safe(() => sheet.properties!.title);
          if (sheetTitle === undefined) {
            return undefined;
          }
          return sheetTitle;
        }));

    const title = safe(() => gapiSpreadsheet.properties!.title);

    return new Spreadsheet({
      id: ID,
      sheets,
      title: title ? title : "untitled",
    });
  }

  public readonly id: string;
  public readonly sheets: Set<string>;
  public readonly title: string;

  private constructor(props: ISpreadsheetProperties) {
    this.id = props.id;
    this.sheets = props.sheets;
    this.title = props.title;
  }

  public values: ISpreadsheetValues = async (
      sheetName?: string, dimension?: string)
      : Promise<any> => {
    if (sheetName === undefined) {
      return undefined;
    }

    const gapiRange = await gapiPromise(gapiSpreadsheets().values.get({
      key: API_KEY,
      majorDimension: dimension,
      range: sheetName,
      spreadsheetId: this.id,
    }));

    if (gapiRange !== undefined && gapiRange.values !== undefined) {
      return gapiRange.values;
    }
    throw new Error("Sheet \"" + sheetName + "\" values failed to load");
  }

  public gridData = async (sheetName: string)
      : Promise<gapi.client.sheets.Spreadsheet> => {
    return gapiPromise(gapiSpreadsheets().get({
      includeGridData: true,
      ranges: sheetName,
      spreadsheetId: this.id,
    }));
  }
}
