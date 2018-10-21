// ============================================================================
// GoogleSheetController.js
// ============================================================================
//
//  Created by leuski on 10/19/18.
//  Copyright (c) 2018 Anton Leuski and ICT. All rights reserved.
// ============================================================================

import React, {Component} from 'react';

import * as util from '../util.js';
import Button from './woz/Button.js';
import Row from './woz/Row.js';
import Screen from './woz/Screen.js';
import RegexSearcher from './woz/RegexSearcher.js';
import '../alfred.css';
import {objectCompactMap, removingFileExtension, compactMap, defined} from "../util";

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

async function loadGAPI() {
  return new Promise( function(resolve) {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/client.js";
    script.onload = () => resolve(window.gapi);
    document.body.appendChild(script)
  });
}

async function loadClient() {
  return new Promise( function(resolve) {
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
      }).then((r) => {resolve(JSON.parse(r.body))}, reject);
    });
    return s;
  });
  return spreadsheet;
}

class GoogleSheetController extends Component {

  loadDataForSetWithName = async (name, buttonSheet, rowSheet) => {
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
    let buttons =  Object.assign({}, ...compactMap(buttonRows.values.slice(1), (values) => {
      // object from a button sheet row with properties based on the first
      // button sheet row values
      let button = Object.assign({
        label: "",
        tooltip: "",
        badges: {}
      }, ...compactMap(values,
          (v, i) => {
            let key = keys[i];
            if (key.length === 0) {
              return undefined;
            }
            return ({ [key]: v })
          }));
      if (!defined(button.id)) {
        return undefined;
      }
      button.transitions = {};
      return ({[button.id]: button});
    }));

    console.log(buttons);

    let rows = Object.assign({}, ...rowRows.values.map(r => {
      return ({[r[0]]:
            {
              id: r[0],
              label: r[1],
              buttons: r.slice(2) // compactMap(r.slice(2), i => {return buttons[i];})
            }});
      }
    ));

    console.log(rows);

    let woz = {
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

  loadDataFromSpreadsheet = async (ID) => {
    let spreadsheet = await spreadsheetWithID(ID);
    console.log(spreadsheet);
    let buttonSheets = {};
    let rowSheets = {};
    for(let sheet of spreadsheet.sheets) {
      let title = sheet.properties.title;
      if (title.endsWith(".buttons")) {
        buttonSheets[removingFileExtension(title)] = sheet;
      }
      if (title.endsWith(".rows")) {
        rowSheets[removingFileExtension(title)] = sheet;
      }
    }

    let allData = await Promise.all(objectCompactMap(buttonSheets,
        ([k,v]) => {
          console.log(k);
          return rowSheets.hasOwnProperty(k) ? this.loadDataForSetWithName(
              k, v, rowSheets[k]) : undefined;
        }));

    let WoZs = Object.assign({}, ...allData.map(s => ({[s.id]: s})));
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
            selectedScreenID: firstScreen
          });
          this.regexSearcher = new RegexSearcher(this.state.data);
        });
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

  // noinspection JSUnusedGlobalSymbols
  componentDidMount = () => {
    this.initializeGAPI()
        .then(
            () => {this.loadData();},
            (err) => {console.log('Error: ' + err);});
  };

  constructor(props)
  {
    super(props);

    this.state = {
      data: null,
      selectedScreenID: null
    };

    this.resultCount = 8;
  }

  presentScreen(screenID)
  {
    this.setState({selectedScreenID: screenID});
  }

  handleClick(buttonID)
  {
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
        // return;
      }
    }

    // util.performRemoteObjectMethod(this.props.component, "playClipWithID:",
    //     buttonID);
  }

  _filterResults(inResultArray) {
    if (!util.defined(inResultArray) || inResultArray.length === 0) {
      return null;
    }

    let resultArray = inResultArray;

    if (resultArray.length > this.resultCount) {
      resultArray = resultArray.slice(0, this.resultCount);
    }

    while (resultArray.length < this.resultCount) {
      resultArray.push(Button.placeholderID);
    }

    return resultArray;
  }

  _search(inText, inDelay) {
    this.query = inText.trim();
    if (!this.timer) {
      this.timer = window.setTimeout(this._timerCallback.bind(this), inDelay);
    }
  }

  _didFindButtons(buttonList) {
    this.setState({regexResult: this._filterResults(buttonList)});
  }

  _timerCallback() {
    this.timer = null;

    this.regexSearcher.search(this.query, this.resultCount,
        this._didFindButtons.bind(this));
  }

  searchDelayed(event) {
    if (event.keyCode === 13) {
      this.searchImmediately(event);
    } else {
      this._search(event.target.value, 500);
    }
  }

  searchImmediately(event) {
    this._search(event.target.value, 0);
  }

  render() {
    let errorMessage = null;

    if (!util.defined(this.state.data) ||
        !util.defined(this.state.data.screens)) {
      errorMessage = "WoZ UI data is not loaded.";
    } else if (this.state.data.screens.length === 0) {
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
        || !this.state.data.allScreenIDs
            .includes(this.state.selectedScreenID)) {
      this.setState({
        data: this.state.data,
        selectedScreenID: this.state.data.allScreenIDs[0]
      })
    }

    const handleClick = this.handleClick.bind(this);

    return (
        <div className="searchableTable">
          <div className="searchField">
            <input
                type={"search"}
                onBlur={this.searchImmediately.bind(this)}
                onPaste={this.searchImmediately.bind(this)}
                onChange={this.searchImmediately.bind(this)}
                onKeyDown={this.searchDelayed.bind(this)}
                placeholder="Search"
                autoSave="WoZSearch"
            />
          </div>
          <div className="scrollable">
            <div>
              <Row data={this.state.data}
                   buttons={this.state.regexResult}
                   label={"Search Results"}
                   index={0}
                   onButtonClick={handleClick}/>
              <Screen
                  data={this.state.data}
                  identifier={this.state.selectedScreenID}
                  onButtonClick={handleClick}/>
            </div>
          </div>
        </div>
    );
  }
}

export default GoogleSheetController;
