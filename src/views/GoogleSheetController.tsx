/* eslint-disable import/first */
// ============================================================================
// GoogleSheetController.js
// ============================================================================
//
//  Created by leuski on 10/19/18.
//  Copyright (c) 2018 Anton Leuski and ICT. All rights reserved.
// ============================================================================


import * as React from 'react';
import * as util from '../util';
import * as Button from './woz/Button';
import * as Row from './woz/Row';
import * as Screen from './woz/Screen';
import * as RegexSearcher from './woz/RegexSearcher';
import * as Model from './woz/Model';

import '../alfred.css';

// noinspection SpellCheckingInspection
const CLIENT_ID = '525650522819-5hs8fbqp0an3rqg6cnv2fbb57iuskhvc.apps.googleusercontent.com';
// "project_id":"vivid-cache-219919"

// noinspection SpellCheckingInspection
const API_KEY = 'AIzaSyD-j_mpMgzWZVZSjLeOTbqhVGcEX3qa5lU';

// Array of API discovery doc URLs for APIs used by the quickstart
// noinspection SpellCheckingInspection
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
// noinspection SpellCheckingInspection
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    // noinspection SpellCheckingInspection
    gapi: any;
  }
}

window.gapi = window.gapi || {};

async function loadGAPI() {
  return new Promise(function (resolve) {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/client.js";
    script.onload = () => resolve(window.gapi);
    document.body.appendChild(script)
  });
}

async function loadClient() {
  return new Promise(function (resolve) {
    window.gapi.load('client', resolve);
  });
}

async function initializeClient() {
  return window.gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  });
}

async function spreadsheetWithID(spreadsheetId) {
  let response = await window.gapi.client.sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId
  });
  let spreadsheet = JSON.parse(response.body);
  spreadsheet.sheets = spreadsheet.sheets.map((s) => {
    s.rowMajorValues = new Promise(function (resolve, reject) {
      window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: s.properties.title,
      }).then((r) => {
        resolve(JSON.parse(r.body))
      }, reject);
    });
    return s;
  });
  return spreadsheet;
}

enum WozState {
  NONE,
  LOADING,
  READY
}

interface GoogleSheetControllerState {
  state: WozState;
  data: Model.WozModel;
  selectedScreenID: string;
  regexResult: Array<string>;
}

export class GoogleSheetController extends React.Component<{}, GoogleSheetControllerState> {

  loadDataForSetWithName = async (name, buttonSheet, rowSheet)
      : Promise<Model.WozModel> => {
    let buttonRows = await buttonSheet.rowMajorValues;
    let rowRows = await rowSheet.rowMajorValues;

    console.log(buttonRows);

    let keys = buttonRows.values[0].map(v => {
      v = v.trim();
      if (!v.startsWith("woz.")) {
        return "";
      }
      v = v.split('.').splice(1).join('.');
      return v.trim();
    });

    // a dictionary of buttons indexed by the button id
    let buttons = Object.assign({},
        ...util.compactMap(buttonRows.values.slice(1), (values) => {
      // object from a button sheet row with properties based on the first
      // button sheet row values
      let button: Model.ButtonModel = Object.assign(new Model.ButtonModel(),
          ...util.compactMap(values,
              (v, i) => {
                let key = keys[i];
                if (key.length === 0) {
                  return undefined;
                }
                return ({[key]: v})
              }));
      return util.defined(button.id) ? ({[button.id]: button}) : undefined;
    }));

    console.log(buttons);

    let rows = Object.assign({},
        ...util.compactMap(rowRows.values, r => {
      if (!util.defined(r) || r.length < 2) { return undefined; }
      let row = new Model.RowModel(r[0], r[1], r.slice(2));
      return util.defined(row.id) ? ({[r[0]]: row}) : undefined;
    }));

    console.log(rows);

    let woz: Model.WozModel = {
      id: name,
      screens: {},
      rows: rows,
      buttons: buttons,
      allScreenIDs: [name],
      colors: {}
    };

    woz.screens[name] = {
      id: name,
      label: name,
      rows: Object.keys(rows)
    };

    return woz;
  };

  loadDataFromSpreadsheet = async (ID: string): Promise<Model.WozCollectionModel> => {
    let spreadsheet = await spreadsheetWithID(ID);
    console.log(spreadsheet);
    let buttonSheets = {};
    let rowSheets = {};
    for (let sheet of spreadsheet.sheets) {
      let title = sheet.properties.title;
      if (title.endsWith(".buttons")) {
        buttonSheets[util.removingFileExtension(title)] = sheet;
      }
      if (title.endsWith(".rows")) {
        rowSheets[util.removingFileExtension(title)] = sheet;
      }
    }

    let allData = await Promise.all(util.objectCompactMap(buttonSheets,
        ([k, v]) => {
          console.log(k);
          return rowSheets.hasOwnProperty(k) ? this.loadDataForSetWithName(
              k, v, rowSheets[k]) : undefined;
        }));

    let WoZs = Object.assign({}, ...allData
        .map((s: Model.WozModel) => ({[s.id]: s})));
    console.log(WoZs);

    return WoZs;
  };

  updateSignInStatus = (isSignedIn) => {
    let authInstance = window.gapi.auth2.getAuthInstance();
    console.log("isSignedIn: ", authInstance.isSignedIn.get());

    if (!isSignedIn) {
      // noinspection JSIgnoredPromiseFromCall
      authInstance.signIn();
    } else {
      this.loadData();
    }
  };

  loadData = () => {
    // noinspection SpellCheckingInspection
    this.loadDataFromSpreadsheet('1zaCUTsvAsGJv-XcG1bXeKzKPsjsh7u2NbhmZV24uM8I')
        .then((data) => {
          console.log(data);
          this.wozData = data;
          let firstWoz = this.wozData[Object.keys(this.wozData)[0]];
          let firstScreen = firstWoz.allScreenIDs[0];
          this.setState({
            data: firstWoz,
            selectedScreenID: firstScreen,
            state: WozState.READY
          });
          this.regexSearcher = new RegexSearcher.RegexSearcher(this.state.data);
        }, (err) => {this._handleError(err);});
  };

  initializeGAPI = async () => {
    await loadGAPI();
    await loadClient();
    await initializeClient();

    let authInstance = window.gapi.auth2.getAuthInstance();

    authInstance.isSignedIn.listen((isSignedIn) => {
      this.updateSignInStatus(isSignedIn);
    });

    if (!authInstance.isSignedIn.get()) {
      return authInstance.signIn();
    }
  };

  _handleError = (error) => {
    console.log('Error: ' + error);
    this.setState(()=> {
      return {
        state: WozState.NONE
      }
    });
  };

  // noinspection JSUnusedGlobalSymbols
  componentDidMount = () => {
    this.setState(()=> {
      return {
        state: WozState.LOADING
      }
    });
    this.initializeGAPI()
        .then(
            () => {this.loadData();},
            (err) => {this._handleError(err);});
  };

  private query: string;
  private timer: number;
  private readonly resultCount: number;
  private regexSearcher: RegexSearcher.RegexSearcher;
  private wozData: Model.WozCollectionModel;

  constructor(props)
  {
    super(props);

    this.state = {
      state: WozState.NONE,
      regexResult: undefined,
      data: null,
      selectedScreenID: null
    };

    this.resultCount = 8;
  }

  presentScreen = (screenID) => {
    this.setState({selectedScreenID: screenID});
  };

  handleClick = (buttonID) => {
    let buttonModel = this.state.data.buttons[buttonID];
    if (!util.defined(buttonModel)) {
      return;
    }

    if (util.defined(buttonModel.transitions)) {
      let targetID = buttonModel.transitions[this.state.selectedScreenID];
      if (!util.defined(targetID)) {
        targetID = buttonModel.transitions["_any"];
      }
      if (util.defined(targetID)) {
        this.presentScreen(targetID);
        return;
      }
    }

    console.log(buttonID);
  };

  _filterResults = (inResultArray) => {
    if (!util.defined(inResultArray) || inResultArray.length === 0) {
      return null;
    }

    let resultArray = inResultArray;

    if (resultArray.length > this.resultCount) {
      resultArray = resultArray.slice(0, this.resultCount);
    }

    while (resultArray.length < this.resultCount) {
      resultArray.push(Button.Button.placeholderID);
    }

    return resultArray;
  };

  _search = (inText, inDelay) => {
    this.query = inText.trim();
    if (!this.timer) {
      this.timer = window.setTimeout(this._timerCallback, inDelay);
    }
  };

  _didFindButtons = (buttonList) => {
    this.setState({regexResult: this._filterResults(buttonList)});
  };

  _timerCallback = () => {
    this.timer = null;

    this.regexSearcher.search(this.query, this.resultCount,
        this._didFindButtons);
  };

  searchDelayed = (event) => {
    if (event.keyCode === 13) {
      this.searchImmediately(event);
    } else {
      this._search(event.target.value, 500);
    }
  };

  searchImmediately = (event) => {
    this._search(event.target.value, 0);
  };

  render() {
    let errorMessage = null;

    if (this.state.state == WozState.LOADING) {
      return (
          <div className="statusMessage">
            {"Loading..."}
          </div>
      );
    }

    if (this.state.state == WozState.NONE) {
      return (
          <div className="statusMessage">
            {"WoZ UI data is not loaded."}
          </div>
      );
    }

    if (!util.defined(this.state.data) ||
        !util.defined(this.state.data.screens)) {
      errorMessage = "WoZ UI data is not loaded.";
    } else if (Object.keys(this.state.data.screens).length === 0) {
      errorMessage = "WoZ UI data is empty.";
    }

    if (errorMessage !== null) {
      return (
          <div className="statusMessage">
            {errorMessage}
          </div>
      );
    }

    if (this.state.selectedScreenID === null
        || !util.defined(this.state.data.screens[this.state.selectedScreenID])) {
      this.setState(function (prevState) {
        return {
          selectedScreenID: prevState.data.allScreenIDs[0]
        }
      })
    }

    return (
        <div className="searchableTable">
          <div className="searchField">
            <input
                type={"search"}
                onBlur={this.searchImmediately}
                onPaste={this.searchImmediately}
                onChange={this.searchImmediately}
                onKeyDown={this.searchDelayed}
                placeholder="Search"
                autoSave="WoZSearch"
            />
          </div>
          <div className="scrollable">
            <div>
              <Row.Row data={this.state.data}
                       buttons={this.state.regexResult}
                       label={"Search Results"}
                       index={0}
                       onButtonClick={this.handleClick}/>
              <Screen.Screen
                  data={this.state.data}
                  identifier={this.state.selectedScreenID}
                  onButtonClick={this.handleClick}/>
            </div>
          </div>
        </div>
    );
  }
}