import {arrayMap, objectFromArray} from "../../common/util";
import {IWozDataSource} from "../../woz/model/Model";
import {Store} from "../Store";
import {GoogleSheetWozDataSource} from "./google/GoogleSheetWozDataSource";

export class DataSources {
  public static shared = new DataSources();

  // noinspection JSMethodCanBeStatic
  public get selectedDataSource(): IWozDataSource | undefined {
    const id = Store.shared.selectedSpreadsheetID;
    if (id === undefined) {
      return undefined;
    }
    const sheet = Store.shared.knownSpreadsheets[id];
    if (sheet === undefined) {
      return undefined;
    }
    return new GoogleSheetWozDataSource(id, sheet.title, sheet.lastAccess);
  }

  // noinspection JSMethodCanBeStatic
  public set selectedDataSource(newValue: IWozDataSource | undefined) {
    if (newValue !== undefined && newValue instanceof GoogleSheetWozDataSource) {
      Store.shared.selectedSpreadsheetID = newValue.id;
    } else {
      Store.shared.selectedSpreadsheetID = undefined;
    }
  }

  public get recentDataSources(): {[id: string]: IWozDataSource } {
    return objectFromArray(arrayMap(
        Object.entries(Store.shared.knownSpreadsheets),
        ([id, sheet]): [string, IWozDataSource] => {
          return [id, new GoogleSheetWozDataSource(id, sheet.title, sheet.lastAccess)];
        }));
  }
}
