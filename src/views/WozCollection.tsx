// ============================================================================
// GoogleSheetController.js
// ============================================================================
//
//  Created by leuski on 10/19/18.
//  Copyright (c) 2018 Anton Leuski and ICT. All rights reserved.
// ============================================================================

import * as React from "react";
import {SyntheticEvent} from "react";
import {
  Container,
  Dropdown,
  DropdownProps,
  Grid,
  Input,
} from "semantic-ui-react";
import "../alfred.css";
import {GoogleSheetWozLoader} from "../controller/GoogleSheetWozLoader";
import {log} from "../controller/Logger";
import {RegexSearcher} from "../controller/RegexSearcher";
import {IButtonModel} from "../model/ButtonModel";
import {IWozCollectionModel} from "../model/Model";
import {IWozContent, WozModel} from "../model/WozModel";
import {arrayMap} from "../util";
import {Button} from "./Button";
import {Row} from "./Row";
import {Screen} from "./Screen";

enum WozState {
  NONE,
  LOADING,
  READY,
  FAILED,
}

interface IWozCollectionState {
  error?: Error;
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
  private wozData?: IWozCollectionModel;

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
        .then((data: IWozCollectionModel) => {
              this._handleDataLoaded(data);
            },
            (err) => {
              this._handleError(err);
            });
  }

  public render() {
    if (this.state.state === WozState.NONE) {
      return (
          <div className="statusMessage">
            {"WoZ UI is not loaded."}
          </div>
      );
    }

    if (this.wozData === undefined) {
      const globalMessage = (this.state.state === WozState.FAILED)
          ? "WoZ UI failed to load." + (this.state.error === undefined
          ? "" : " " + this.state.error.message) : "Loading...";
      return (
          <div className="statusMessage">
            {globalMessage}
          </div>
      );
    }

    const wozSelector = !this.state.selectedWoz || Object.keys(this.wozData).length <= 1
        ? "" : this._wozSelectorComponent(this.wozData, this.state.selectedWoz);

    const hasWoz = (this.state.state === WozState.READY
        && this.state.selectedWoz !== undefined);

    const searchField = hasWoz ? (
        <Input icon={{name: "search", circular: true, link: true}}
               className={"woz_search_field"}
               onChange={(_event, data) => this._search(data.value, 100)}
               placeholder="Search..."/>) : null;

    const header = (
        <Container className={"woz_table_header"} fluid>
          <Grid columns={2}>
            <Grid.Column floated="left">
              {searchField}
            </Grid.Column>
            <Grid.Column textAlign="right" floated="right">
              {wozSelector}
            </Grid.Column>
          </Grid>
        </Container>
    );

    if (this.state.state === WozState.READY
        && this.state.selectedWoz !== undefined) {
      return (
          <div className="searchableTable">
            {header}
            <div className="scrollable">
              <div>
                <Row context={this.state.selectedWoz}
                     buttons={this.state.regexResult}
                     label={"Search Results"}
                     index={0}
                     onButtonClick={this._handleClick}/>
                <Screen
                    context={this.state.selectedWoz}
                    identifier={this.state.selectedScreenID}
                    onButtonClick={this._handleClick}/>
              </div>
            </div>
          </div>
      );
    }

    const name = this.state.selectedWoz !== undefined ? this.state.selectedWoz.id : "unknown";

    const message = (this.state.state === WozState.FAILED)
        ? "WoZ UI for \"" + name + "\" failed to load. " + (this.state.error === undefined
        ? "" : " " + this.state.error.message) : "Loading UI for \"" + name + "\"...";

    return (
        <div className="searchableTable">
          {header}
          <div className="statusMessage">
            {message}
          </div>
        </div>
    );

  }

  private _wozSelectorComponent = (
      wozData: IWozCollectionModel,
      selectedWoz: WozModel) => {
    const allWozs = Object.values(wozData);
    allWozs.sort((a, b) => a.id.localeCompare(b.id));
    // const options = arrayMap(allWozs, (woz) => {
    //   return (
    //       <option key={woz.id} value={woz.id}>{woz.id}</option>
    //   );
    // });

    const options = arrayMap(allWozs, (woz) => {
      return {
        key: woz.id, text: woz.id, value: woz.id,
      };
    });

    return (
        <Dropdown placeholder="Select Country"
                  className={"woz_selector_dropdown"}
                  search selection
                  allowAdditions={false}
                  options={options}
                  onChange={this._changeWoz}
                  value={selectedWoz.id}/>
    );
  }

  // private get selectedWozID(): string | undefined {
  //   return this.state.selectedWoz.id;
  // }

  private set selectedWozID(newID: string | undefined) {
    if (newID === undefined || this.wozData === undefined) {
      this.setState({
        error: new Error("The WoZ UI ID is not defined."),
        selectedScreenID: undefined,
        selectedWoz: undefined,
        state: WozState.FAILED,
      });
      this.regexSearcher = undefined;
      return;
    }

    const woz = this.wozData[newID];
    if (this.state.selectedWoz === woz) {
      return;
    }

    this.setState({
      selectedScreenID: undefined,
      selectedWoz: woz,
      state: WozState.LOADING,
    });

    log.debug("will load " + newID);

    woz.loadContent().then(
        (data: IWozContent) => {
          const screenKeys = Object.keys(data.screens);
          if (screenKeys.length === 0) {
            this._handleError(new Error("No screens in WoZ"));
            return;
          }
          const firstScreen = screenKeys[0];
          this.regexSearcher = new RegexSearcher(data);
          this.setState({
            selectedScreenID: firstScreen,
            selectedWoz: woz,
            state: WozState.READY,
          });
        },
        (error: Error) => {
          this._handleError(error);
        });
  }

  private _changeWoz = (
      _event: SyntheticEvent<HTMLElement>,
      data: DropdownProps) => {
    log.debug(data.value);
    this.selectedWozID = data.value as string;
  }

  private _handleDataLoaded = (data: IWozCollectionModel) => {
    // log.debug(selectedWoz);
    this.wozData = data;
    this.selectedWozID = Object.keys(this.wozData)[0];
  }

  private _handleError = (error: any) => {
    log.error(error);
    this.setState(() => {
      return {
        error,
        state: WozState.FAILED,
      };
    });
  }

  private _presentScreen = (screenID: string) => {
    this.setState({selectedScreenID: screenID});
  }

  private _handleClick = (buttonModel: IButtonModel) => {
    if (this.state === undefined
        || this.state.selectedWoz === undefined
        || this.state.selectedScreenID === undefined) {
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

    log.debug("clicked:", "'" + buttonModel.id + "'", buttonModel.tooltip);
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

  // private _searchDelayed = (event: React.KeyboardEvent<HTMLInputElement>) =>
  // { if (event.keyCode === 13) { this._searchImmediately(event); } else {
  // this._search(event.currentTarget.value, 500); } }  private
  // _searchImmediately = (event: React.SyntheticEvent<HTMLInputElement>) => {
  // this._search(event.currentTarget.value, 0); }
}
