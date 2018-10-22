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
import {IWozCollectionModel} from "../model/Model";
import {WozModel} from "../model/WozModel";
import {Button} from "./Button";
import {Row} from "./Row";
import {Screen} from "./Screen";

enum WozState {
  NONE,
  LOADING,
  READY,
}

interface IWozCollectionState {
  regexResult?: string[];
  selectedScreenID?: string;
  selectedWoz?: WozModel;
  state: WozState;
}

interface IWozCollectionProperties {
  spreadsheetID: string;
}

export class WozCollection extends React.Component<IWozCollectionProperties, IWozCollectionState> {

  private query?: string;
  private timer?: number;
  private readonly resultCount: number;
  private regexSearcher?: RegexSearcher;
  private wozData?: Model.IWozCollectionModel;

  constructor(props: IWozCollectionProperties) {
    super(props);

    this.state = {
      regexResult: undefined,
      selectedScreenID: undefined,
      selectedWoz: undefined,
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

    if (this.wozData === undefined
        || this.state.selectedWoz === undefined
        || this.state.selectedWoz.screens === undefined) {
      return (
          <div className="statusMessage">
            {"WoZ UI selectedWoz is not loaded."}
          </div>
      );
    } else if (Object.keys(this.state.selectedWoz.screens).length === 0) {
      return (
          <div className="statusMessage">
            {"WoZ UI selectedWoz is empty."}
          </div>
      );
    }

    if (this.state.selectedScreenID === undefined
        || this.state.selectedWoz === undefined
        || this.state.selectedWoz.screens[this.state.selectedScreenID] === undefined) {
      this.setState((prevState) => ({
        selectedScreenID: prevState.selectedWoz
            ? prevState.selectedWoz.allScreenIDs[0] : undefined,
      }));
    }

    const wozSelector = this.state.selectedWoz && Object.keys(this.wozData).length <= 1
        ? "" : this._wozSelectorComponent(this.wozData, this.state.selectedWoz);

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

  private _wozSelectorComponent = (
      wozData: Model.IWozCollectionModel,
      selectedWoz: WozModel) => {
    const allWozs = Object.values(wozData);
    allWozs.sort((a, b) => a.id.localeCompare(b.id));
    const options = allWozs.map((woz) => {
      return (
          <option key={woz.id} value={woz.id}>{woz.id}</option>
      );
    });

    return (
        <select onChange={this._changeWoz} value={selectedWoz.id}>
          {options}
        </select>
    );
  }

  // private get selectedWozID(): string | undefined {
  //   return this.state.selectedWoz.id;
  // }

  private set selectedWozID(newID: string | undefined) {
    if (newID === undefined
        || this.wozData === undefined) {
      this.setState({
        selectedScreenID: undefined,
        selectedWoz: undefined,
        state: WozState.NONE,
      });
      this.regexSearcher = undefined;
      return;
    }
    const woz = this.wozData[newID];
    const firstScreen = woz.allScreenIDs[0];
    this.regexSearcher = new RegexSearcher(woz);
    this.setState({
      selectedScreenID: firstScreen,
      selectedWoz: woz,
      state: WozState.READY,
    });
  }

  private _changeWoz = (event: React.ChangeEvent<HTMLSelectElement>) => {
    log.debug(event.currentTarget.value);
    this.selectedWozID = event.currentTarget.value;
  }

  private _handleDataLoaded = (data: IWozCollectionModel) => {
    // log.debug(selectedWoz);
    this.wozData = data;
    this.selectedWozID = Object.keys(this.wozData)[0];
  }

  private _handleError = (error: any) => {
    log.error("Error: " + error);
    this.setState(() => {
      return {
        state: WozState.NONE,
      };
    });
  }

  private _presentScreen = (screenID: string) => {
    this.setState({selectedScreenID: screenID});
  }

  private _handleClick = (buttonID: string) => {
    if (this.state === undefined
        || this.state.selectedWoz === undefined
        || this.state.selectedScreenID === undefined) {
      return;
    }

    const buttonModel = this.state.selectedWoz.buttons[buttonID];
    if (buttonModel === undefined) {
      return;
    }

    let targetID = buttonModel.transitions[this.state.selectedScreenID];
    if (targetID === undefined) {
      targetID = buttonModel.transitions._any;
    }
    if (targetID !== undefined) {
      this._presentScreen(targetID);
      return;
    }

    log.debug("clicked:", "'" + buttonID + "'", buttonModel.tooltip);
  }

  private _filterResults = (inResultArray?: string[]): string[] | undefined => {
    if (inResultArray === undefined || inResultArray.length === 0) {
      return undefined;
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

  private _search = (inText: string, inDelay: number) => {
    this.query = inText.trim();
    if (this.timer === undefined) {
      this.timer = window.setTimeout(this._timerCallback, inDelay);
    }
  }

  private _didFindButtons = (buttonList: string[]) => {
    this.setState(() => {
      return {
        regexResult: this._filterResults(buttonList),
      };
    });
  }

  private _timerCallback = () => {
    this.timer = undefined;
    if (this.regexSearcher === undefined
        || this.query === undefined) {
      return;
    }
    this.regexSearcher.search(this.query, this.resultCount)
        .then(this._didFindButtons);
  }

  private _searchDelayed = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 13) {
      this._searchImmediately(event);
    } else {
      this._search(event.currentTarget.value, 500);
    }
  }

  private _searchImmediately = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this._search(event.currentTarget.value, 0);
  }
}
