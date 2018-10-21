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
  state: WozState;
  data: WozModel;
  selectedScreenID: string;
  regexResult: [string];
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
      data: null,
      regexResult: undefined,
      selectedScreenID: null,
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
        .then((data) => {this._handleDataLoaded(data); },
        (err) => {this._handleError(err); });
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
      this.setState((prevState) => ({
        selectedScreenID: prevState.data.allScreenIDs[0],
      }));
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
              <Row data={this.state.data}
                       buttons={this.state.regexResult}
                       label={"Search Results"}
                       index={0}
                       onButtonClick={this.handleClick}/>
              <Screen
                  data={this.state.data}
                  identifier={this.state.selectedScreenID}
                  onButtonClick={this.handleClick}/>
            </div>
          </div>
        </div>
    );
  }

  private _handleDataLoaded = (data) => {
    // log.debug(data);
    this.wozData = data;
    const firstWoz = this.wozData[Object.keys(this.wozData)[0]];
    const firstScreen = firstWoz.allScreenIDs[0];
    this.setState({
      data: firstWoz,
      selectedScreenID: firstScreen,
      state: WozState.READY,
    });
    this.regexSearcher = new RegexSearcher(this.state.data);
  }

  private _handleError = (error) => {
    log.error("Error: " + error);
    this.setState(() => {
      return {
        state: WozState.NONE,
      };
    });
  }

  private presentScreen = (screenID) => {
    this.setState({selectedScreenID: screenID});
  }

  private handleClick = (buttonID) => {
    const buttonModel = this.state.data.buttons[buttonID];
    if (!util.defined(buttonModel)) {
      return;
    }

    if (util.defined(buttonModel.transitions)) {
      let targetID = buttonModel.transitions[this.state.selectedScreenID];
      if (!util.defined(targetID)) {
        targetID = buttonModel.transitions._any;
      }
      if (util.defined(targetID)) {
        this.presentScreen(targetID);
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

  private searchDelayed = (event) => {
    if (event.keyCode === 13) {
      this.searchImmediately(event);
    } else {
      this._search(event.target.value, 500);
    }
  }

  private searchImmediately = (event) => {
    this._search(event.target.value, 0);
  }
}
