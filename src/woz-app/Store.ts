import {IFirebaseConnectorModel} from "./connector/firebase/FirebaseConnector";
import {IVHMSGModel, VHMSG} from "./connector/vhmsg/vhmsg";

interface IStoredSpreadsheet {
  title: string;
}

interface IStore {
  firebase: IFirebaseConnectorModel;
  selectedSpreadsheetID: string;
  knownSpreadsheets: {[s: string]: IStoredSpreadsheet};
  selectedConnectorID?: string;
  vhmsg: IVHMSGModel;
}

export class Store implements IStore {
  public static shared = new Store();

  // @ts-ignore
  public selectedSpreadsheetID: string;
  // @ts-ignore
  public knownSpreadsheets: {[s: string]: IStoredSpreadsheet};
  // @ts-ignore
  public selectedConnectorID?: string;
  // @ts-ignore
  public vhmsg: IVHMSGModel;
  // @ts-ignore
  public firebase: IFirebaseConnectorModel;

  private readonly defaults: IStore;

  constructor() {

    // Important!!! Only use constant expressions here.

    // noinspection SpellCheckingInspection
    this.defaults = {
      firebase: {serverURL: "http://104.197.130.66/ad-client-service-servlet"},
      knownSpreadsheets: {
        ["1aHJSSfLrmauXWS7W2vyzv1Sn5AKbeWOBLBP2EEjTsBE"]: { title: "Test WoZ" },
      },
      selectedSpreadsheetID: "1aHJSSfLrmauXWS7W2vyzv1Sn5AKbeWOBLBP2EEjTsBE",
      vhmsg: {address: "127.0.0.1", scope: VHMSG.DEFAULT_SCOPE, secure: false},
    };

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
