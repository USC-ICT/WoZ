import {IWozCollectionModel, IWozProvider} from "../../../woz/model/Model";
import {GoogleSheetWozLoader} from "./GoogleSheetWozLoader";

export class GoogleSheetWozProvider implements IWozProvider {
  private readonly spreadsheetID: string;

  constructor(spreadsheetID: string) {
    this.spreadsheetID = spreadsheetID;
  }

  // noinspection JSUnusedGlobalSymbols
  public loadWozCollection = (): Promise<IWozCollectionModel> => {
    return GoogleSheetWozLoader.shared
        .loadDataFromSpreadsheet(this.spreadsheetID);
  }

  // noinspection JSUnusedGlobalSymbols
  public isEqual = (other: IWozProvider): boolean => {
    return other instanceof GoogleSheetWozProvider ? other.spreadsheetID === this.spreadsheetID : false;
  }
}
