/* eslint-disable import/first */

import {ButtonModel} from "../model/ButtonModel";
import * as Model from "../model/Model";
import {RowModel} from "../model/RowModel";
import {WozModel} from "../model/WozModel";
import * as util from "../util";
import {log} from "./Logger";

// noinspection SpellCheckingInspection
const CLIENT_ID = "525650522819-5hs8fbqp0an3rqg6cnv2fbb57iuskhvc.apps.googleusercontent.com";
// "project_id":"vivid-cache-219919"

// noinspection SpellCheckingInspection
const API_KEY = "AIzaSyD-j_mpMgzWZVZSjLeOTbqhVGcEX3qa5lU";

// Array of API discovery doc URLs for APIs used by the quickstart
// noinspection SpellCheckingInspection
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
// noinspection SpellCheckingInspection
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

declare global {
  /* tslint:disable */
  // noinspection JSUnusedGlobalSymbols, TsLint
  interface Window {
    // noinspection SpellCheckingInspection
    gapi: any;
  }
  /* tslint:enable */
}

async function loadGAPI() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/client.js";
    script.onload = () => resolve(window.gapi);
    document.body.appendChild(script);
  });
}

async function loadClient() {
  return new Promise((resolve) => {
    window.gapi.load("client", resolve);
  });
}

async function initializeClient() {
  return window.gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES,
  });
}

async function spreadsheetWithID(ID) {
  const response = await window.gapi.client.sheets.spreadsheets.get({
    spreadsheetId: ID,
  });
  const spreadsheet = JSON.parse(response.body);
  spreadsheet.sheets = spreadsheet.sheets.map((s) => {
    s.rowMajorValues = new Promise((resolve, reject) => {
      window.gapi.client.sheets.spreadsheets.values.get({
        range: s.properties.title,
        spreadsheetId: ID,
      }).then((r) => {
        resolve(JSON.parse(r.body));
      }, reject);
    });
    return s;
  });
  return spreadsheet;
}

export class GoogleSheetWozLoader {
  public static shared: GoogleSheetWozLoader = new GoogleSheetWozLoader();

  // noinspection SpellCheckingInspection
  private readonly gapiPromise: Promise<any>;

  private constructor() {
    this.gapiPromise = this.initializeGAPI();
  }

  public loadDataFromSpreadsheet = async (ID: string)
      : Promise<Model.IWozCollectionModel> => {
    await this.gapiPromise;

    const spreadsheet = await spreadsheetWithID(ID);
    // log.debug(spreadsheet);
    const buttonSheets = {};
    const rowSheets = {};
    for (const sheet of spreadsheet.sheets) {
      const title = sheet.properties.title;
      if (title.endsWith(".buttons")) {
        buttonSheets[util.removingFileExtension(title)] = sheet;
      }
      if (title.endsWith(".rows")) {
        rowSheets[util.removingFileExtension(title)] = sheet;
      }
    }

    const allData = await Promise.all(util.objectCompactMap(buttonSheets,
        ([k, v]) => {
          // log.debug(k);
          return rowSheets.hasOwnProperty(k) ? this.loadDataForSetWithName(
              k, v, rowSheets[k]) : undefined;
        }));

    const wozs = Object.assign({}, ...allData
        .map((s: WozModel) => ({[s.id]: s})));
    // log.debug(wozs);

    return wozs;
  }

  public updateSignInStatus = (isSignedIn) => {
    const authInstance = window.gapi.auth2.getAuthInstance();
    // log.debug("isSignedIn: ", authInstance.isSignedIn.get());

    if (!isSignedIn) {
      // noinspection JSIgnoredPromiseFromCall
      authInstance.signIn();
    } else {
      // this.loadData();
    }
  }

  private loadDataForSetWithName = async (name, buttonSheet, rowSheet)
      : Promise<WozModel> => {
    const buttonRows = await buttonSheet.rowMajorValues;
    const rowRows = await rowSheet.rowMajorValues;

    // log.debug(buttonRows);

    const keys = buttonRows.values[0].map((v) => {
      v = v.trim();
      if (!v.startsWith("woz.")) {
        return "";
      }
      v = v.split(".").splice(1).join(".");
      return v.trim();
    });

    // a dictionary of buttons indexed by the button id
    const buttons = Object.assign({},
        ...util.compactMap(buttonRows.values.slice(1), (values) => {
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
        ...util.compactMap(rowRows.values, (r) => {
          if (!util.defined(r) || r.length < 2) { return undefined; }
          const row = new RowModel(r[0], r[1], r.slice(2));
          return util.defined(row.id) ? ({[r[0]]: row}) : undefined;
        }));

    // log.debug(rows);

    const woz: WozModel = {
      allScreenIDs: [name],
      buttons,
      colors: {},
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

  private initializeGAPI = async () => {
    await loadGAPI();
    await loadClient();
    await initializeClient();

    const authInstance = window.gapi.auth2.getAuthInstance();

    authInstance.isSignedIn.listen((isSignedIn) => {
      this.updateSignInStatus(isSignedIn);
    });

    if (!authInstance.isSignedIn.get()) {
      return authInstance.signIn();
    }
  }
}
