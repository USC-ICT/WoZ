import {ConsoleConnector} from "../configuration/connector/console/ConsoleConnector";
import {IFirebaseConnectorModel} from "../configuration/connector/firebase/FirebaseConnector";
import {IVHMSGModel, VHMSG} from "../configuration/connector/vhmsg/vhmsg";

interface IStoredSpreadsheet {
  title: string;
}

interface IStore {
  firebase: IFirebaseConnectorModel;
  selectedSpreadsheetID: string;
  knownSpreadsheets: {[s: string]: IStoredSpreadsheet};
  selectedConnectorID: string;
  vhmsg: IVHMSGModel;
}

export class Store implements IStore {
  public static shared = new Store();

  // @ts-ignore
  public selectedSpreadsheetID: string;
  // @ts-ignore
  public knownSpreadsheets: {[s: string]: IStoredSpreadsheet};
  // @ts-ignore
  public selectedConnectorID: string;
  // @ts-ignore
  public vhmsg: IVHMSGModel;
  // @ts-ignore
  public firebase: IFirebaseConnectorModel;

  // noinspection SpellCheckingInspection
  private readonly defaults: IStore = {
    firebase: {serverURL: "http://104.197.130.66/ad-client-service-servlet"},
    knownSpreadsheets: {},
    selectedConnectorID: ConsoleConnector.name,
    selectedSpreadsheetID: "1zaCUTsvAsGJv-XcG1bXeKzKPsjsh7u2NbhmZV24uM8I",
    vhmsg: {address: "127.0.0.1", scope: VHMSG.DEFAULT_SCOPE, secure: false},
  };

  constructor() {
    return new Proxy(this, {
      get: (_target, property): any => {
        if (typeof property !== "string") {
          return undefined;
        }
        const value = localStorage.getItem(property);
        if (value !== undefined && value !== null) {
          return JSON.parse(value);
        }
        // @ts-ignore
        return this.defaults[property];
      },

      set: (_target, property, newValue): boolean => {
        if (typeof property !== "string") {
          return false;
        }
        localStorage.setItem(property, JSON.stringify(newValue));
        return true;
      },
    });
  }
}
