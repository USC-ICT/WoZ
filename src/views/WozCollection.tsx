// ============================================================================
// GoogleSheetController.js
// ============================================================================
//
//  Created by leuski on 10/19/18.
//  Copyright (c) 2018 Anton Leuski and ICT. All rights reserved.
// ============================================================================

import * as React from "react";
import "../alfred.css";
import {GoogleSheetWozLoader} from "../controller/GoogleSheetWozLoader";
import {log} from "../controller/Logger";
import {RegexSearcher} from "../controller/RegexSearcher";
import * as Model from "../model/Model";
import {WozModel} from "../model/WozModel";
import * as util from "../util";
import {Button} from "./Button";
import {Row} from "./Row";
import {Screen} from "./Screen";

enum WozState {
  NONE,
  LOADING,
  READY,
}

interface IWozCollectionState {
  regexResult: [string];
  selectedScreenID: string;
  selectedWoz: WozModel;
  state: WozState;
}

interface IWozCollectionProperties {
  spreadsheetID: string;
}

export class WozCollection extends React.Component<IWozCollectionProperties, IWozCollectionState> {

  private query: string;
  private timer: number;
  private readonly resultCount: number;
  private regexSearcher: RegexSearcher;
  private wozData: Model.IWozCollectionModel;

  constructor(props) {
    super(props);

    this.state = {
      regexResult: undefined,
      selectedScreenID: null,
      selectedWoz: null,
      state: WozState.NONE,
    };

    this.resultCount = 8;
  }

  // noinspection JSUnusedGlobalSymbols
  public componentDidMount = () => {
    this.setState(() => {
      return {
        state: WozState.LOADING,
      };
    });
    GoogleSheetWozLoader.shared
        .loadDataFromSpreadsheet(this.props.spreadsheetID)
        .then((data) => {
              this._handleDataLoaded(data);
            },
            (err) => {
              this._handleError(err);
            });
  }

  public render() {
    let errorMessage = null;

    if (this.state.state === WozState.LOADING) {
      return (
          <div className="statusMessage">
            {"Loading..."}
          </div>
      );
    }

    if (this.state.state === WozState.NONE) {
      return (
          <div className="statusMessage">
            {"WoZ UI selectedWoz is not loaded."}
          </div>
      );
    }

    if (!util.defined(this.state.selectedWoz) ||
        !util.defined(this.state.selectedWoz.screens)) {
      errorMessage = "WoZ UI selectedWoz is not loaded.";
    } else if (Object.keys(this.state.selectedWoz.screens).length === 0) {
      errorMessage = "WoZ UI selectedWoz is empty.";
    }

    if (errorMessage !== null) {
      return (
          <div className="statusMessage">
            {errorMessage}
          </div>
      );
    }

    if (this.state.selectedScreenID === null
        || !util.defined(this.state.selectedWoz.screens[this.state.selectedScreenID])) {
      this.setState((prevState) => ({
        selectedScreenID: prevState.selectedWoz.allScreenIDs[0],
      }));
    }

    const wozSelector = Object.keys(this.wozData).length <= 1
        ? "" : this._wozSelectorComponent();

    return (
        <div className="searchableTable">
          <div id="wozSearchAndSelector">
            {wozSelector}
            <div className="searchField">
              <input
                  type={"search"}
                  onBlur={this._searchImmediately}
                  onPaste={this._searchImmediately}
                  onChange={this._searchImmediately}
                  onKeyDown={this._searchDelayed}
                  placeholder="Search"
                  autoSave="WoZSearch"
              />
            </div>
          </div>
          <div className="scrollable">
            <div>
              <Row data={this.state.selectedWoz}
                   buttons={this.state.regexResult}
                   label={"Search Results"}
                   index={0}
                   onButtonClick={this._handleClick}/>
              <Screen
                  data={this.state.selectedWoz}
                  identifier={this.state.selectedScreenID}
                  onButtonClick={this._handleClick}/>
            </div>
          </div>
        </div>
    );
  }

  private _wozSelectorComponent = () => {
    const allWozs = Object.values(this.wozData);
    allWozs.sort((a, b) => a.id.localeCompare(b.id));
    const options = allWozs.map((woz) => {
      return (
          <option key={woz.id} value={woz.id}>{woz.id}</option>
      );
    });

    return (
        <select onChange={this._changeWoz} value={this.state.selectedWoz.id}>
          {options}
        </select>
    );
  }

  private get selectedWozID(): string {
    return this.state.selectedWoz.id;
  }

  private set selectedWozID(newID: string) {
    const woz = this.wozData[newID];
    const firstScreen = woz.allScreenIDs[0];
    this.setState({
      selectedScreenID: firstScreen,
      selectedWoz: woz,
      state: WozState.READY,
    });
  }

  private _changeWoz = (event) => {
    log.debug(event.currentTarget.value);
    this.selectedWozID = event.currentTarget.value;
  }

  private _handleDataLoaded = (data) => {
    // log.debug(selectedWoz);
    this.wozData = data;
    this.regexSearcher = new RegexSearcher(this.state.selectedWoz);
    this.selectedWozID = Object.keys(this.wozData)[0];
  }

  private _handleError = (error) => {
    log.error("Error: " + error);
    this.setState(() => {
      return {
        state: WozState.NONE,
      };
    });
  }

  private _presentScreen = (screenID) => {
    this.setState({selectedScreenID: screenID});
  }

  private _handleClick = (buttonID) => {
    const buttonModel = this.state.selectedWoz.buttons[buttonID];
    if (!util.defined(buttonModel)) {
      return;
    }

    if (util.defined(buttonModel.transitions)) {
      let targetID = buttonModel.transitions[this.state.selectedScreenID];
      if (!util.defined(targetID)) {
        targetID = buttonModel.transitions._any;
      }
      if (util.defined(targetID)) {
        this._presentScreen(targetID);
        return;
      }
    }

    log.debug("clicked:", "'" + buttonID + "'", buttonModel.tooltip);
  }

  private _filterResults = (inResultArray) => {
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

  private _search = (inText, inDelay) => {
    this.query = inText.trim();
    if (!this.timer) {
      this.timer = window.setTimeout(this._timerCallback, inDelay);
    }
  }

  private _didFindButtons = (buttonList) => {
    this.setState({regexResult: this._filterResults(buttonList)});
  }

  private _timerCallback = () => {
    this.timer = null;
    this.regexSearcher.search(this.query, this.resultCount)
        .then(this._didFindButtons);
  }

  private _searchDelayed = (event) => {
    if (event.keyCode === 13) {
      this._searchImmediately(event);
    } else {
      this._search(event.target.value, 500);
    }
  }

  private _searchImmediately = (event) => {
    this._search(event.target.value, 0);
  }
}
