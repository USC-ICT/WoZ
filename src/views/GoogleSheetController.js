/* eslint-disable import/first */
// ============================================================================
// GoogleSheetController.js
// ============================================================================
//
//  Created by leuski on 10/19/18.
//  Copyright (c) 2018 Anton Leuski and ICT. All rights reserved.
// ============================================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as React from 'react';
import * as util from '../util';
import * as Button from './woz/Button';
import * as Row from './woz/Row';
import * as Screen from './woz/Screen';
import * as RegexSearcher from './woz/RegexSearcher';
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
window.gapi = window.gapi || {};
function loadGAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve) {
            const script = document.createElement("script");
            script.src = "https://apis.google.com/js/client.js";
            script.onload = () => resolve(window.gapi);
            document.body.appendChild(script);
        });
    });
}
function loadClient() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve) {
            window.gapi.load('client', resolve);
        });
    });
}
function initializeClient() {
    return __awaiter(this, void 0, void 0, function* () {
        return window.gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
        });
    });
}
function spreadsheetWithID(spreadsheetId) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield window.gapi.client.sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId
        });
        let spreadsheet = JSON.parse(response.body);
        spreadsheet.sheets = spreadsheet.sheets.map((s) => {
            s.rowMajorValues = new Promise(function (resolve, reject) {
                window.gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: spreadsheetId,
                    range: s.properties.title,
                }).then((r) => { resolve(JSON.parse(r.body)); }, reject);
            });
            return s;
        });
        return spreadsheet;
    });
}
export class GoogleSheetController extends React.Component {
    constructor(props) {
        super(props);
        this.loadDataForSetWithName = (name, buttonSheet, rowSheet) => __awaiter(this, void 0, void 0, function* () {
            let buttonRows = yield buttonSheet.rowMajorValues;
            let rowRows = yield rowSheet.rowMajorValues;
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
            let buttons = Object.assign({}, ...util.compactMap(buttonRows.values.slice(1), (values) => {
                // object from a button sheet row with properties based on the first
                // button sheet row values
                let button = Object.assign({
                    label: "",
                    tooltip: "",
                    badges: {}
                }, ...util.compactMap(values, (v, i) => {
                    let key = keys[i];
                    if (key.length === 0) {
                        return undefined;
                    }
                    return ({ [key]: v });
                }));
                if (!util.defined(button.id)) {
                    return undefined;
                }
                button.transitions = {};
                return ({ [button.id]: button });
            }));
            console.log(buttons);
            let rows = Object.assign({}, ...rowRows.values.map(r => {
                return ({ [r[0]]: {
                        id: r[0],
                        label: r[1],
                        buttons: r.slice(2) // compactMap(r.slice(2), i => {return buttons[i];})
                    } });
            }));
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
        });
        this.loadDataFromSpreadsheet = (ID) => __awaiter(this, void 0, void 0, function* () {
            let spreadsheet = yield spreadsheetWithID(ID);
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
            let allData = yield Promise.all(util.objectCompactMap(buttonSheets, ([k, v]) => {
                console.log(k);
                return rowSheets.hasOwnProperty(k) ? this.loadDataForSetWithName(k, v, rowSheets[k]) : undefined;
            }));
            let WoZs = Object.assign({}, ...allData
                .map((s) => ({ [s.id]: s })));
            console.log(WoZs);
            return WoZs;
        });
        this.updateSignInStatus = (isSignedIn) => {
            let authInstance = window.gapi.auth2.getAuthInstance();
            console.log("isSignedIn: ", authInstance.isSignedIn.get());
            if (!isSignedIn) {
                // noinspection JSIgnoredPromiseFromCall
                authInstance.signIn();
            }
            else {
                this.loadData();
            }
        };
        this.loadData = () => {
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
                this.regexSearcher = new RegexSearcher.RegexSearcher(this.state.data);
            });
        };
        this.initializeGAPI = () => __awaiter(this, void 0, void 0, function* () {
            yield loadGAPI();
            yield loadClient();
            yield initializeClient();
            let authInstance = window.gapi.auth2.getAuthInstance();
            authInstance.isSignedIn.listen((isSignedIn) => {
                this.updateSignInStatus(isSignedIn);
            });
            if (!authInstance.isSignedIn.get()) {
                return authInstance.signIn();
            }
        });
        // noinspection JSUnusedGlobalSymbols
        this.componentDidMount = () => {
            this.initializeGAPI()
                .then(() => { this.loadData(); }, (err) => { console.log('Error: ' + err); });
        };
        this.presentScreen = (screenID) => {
            this.setState({ selectedScreenID: screenID });
        };
        this.handleClick = (buttonID) => {
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
        this._filterResults = (inResultArray) => {
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
        this._search = (inText, inDelay) => {
            this.query = inText.trim();
            if (!this.timer) {
                this.timer = window.setTimeout(this._timerCallback, inDelay);
            }
        };
        this._didFindButtons = (buttonList) => {
            this.setState({ regexResult: this._filterResults(buttonList) });
        };
        this._timerCallback = () => {
            this.timer = null;
            this.regexSearcher.search(this.query, this.resultCount, this._didFindButtons);
        };
        this.searchDelayed = (event) => {
            if (event.keyCode === 13) {
                this.searchImmediately(event);
            }
            else {
                this._search(event.target.value, 500);
            }
        };
        this.searchImmediately = (event) => {
            this._search(event.target.value, 0);
        };
        this.state = {
            regexResult: [],
            data: null,
            selectedScreenID: null
        };
        this.resultCount = 8;
    }
    render() {
        let errorMessage = null;
        if (!util.defined(this.state.data) ||
            !util.defined(this.state.data.screens)) {
            errorMessage = "WoZ UI data is not loaded.";
        }
        else if (Object.keys(this.state.data.screens).length === 0) {
            errorMessage = "WoZ UI data is empty.";
        }
        if (errorMessage !== null) {
            return (React.createElement("div", { className: "statusMessage" }, errorMessage));
        }
        if (this.state.selectedScreenID === null
            || !util.defined(this.state.data.screens[this.state.selectedScreenID])) {
            this.setState(function (prevState) {
                return {
                    selectedScreenID: prevState.data.allScreenIDs[0]
                };
            });
        }
        return (React.createElement("div", { className: "searchableTable" },
            React.createElement("div", { className: "searchField" },
                React.createElement("input", { type: "search", onBlur: this.searchImmediately, onPaste: this.searchImmediately, onChange: this.searchImmediately, onKeyDown: this.searchDelayed, placeholder: "Search", autoSave: "WoZSearch" })),
            React.createElement("div", { className: "scrollable" },
                React.createElement("div", null,
                    React.createElement(Row.Row, { data: this.state.data, buttons: this.state.regexResult, label: "Search Results", index: 0, onButtonClick: this.handleClick }),
                    React.createElement(Screen.Screen, { data: this.state.data, identifier: this.state.selectedScreenID, onButtonClick: this.handleClick })))));
    }
}
export default GoogleSheetController;
//# sourceMappingURL=GoogleSheetController.js.map