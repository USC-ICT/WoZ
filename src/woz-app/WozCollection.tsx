// ============================================================================
// GoogleSheetController.js
// ============================================================================
//
//  Created by leuski on 10/19/18.
//  Copyright (c) 2018 Anton Leuski and ICT. All rights reserved.
// ============================================================================

import * as React from "react";
import {SyntheticEvent} from "react";
import {Button as SUIButton, Container, Dropdown, DropdownProps, Grid, Icon, Input, Loader} from "semantic-ui-react";
import {Coalescer} from "src/common/Coalescer";
import {log} from "src/common/Logger";
import {arrayMap} from "src/common/util";
import {Button} from "src/woz/views/Button";
import {RegexSearcher} from "../woz/controller/RegexSearcher";
import {IButtonModel} from "../woz/model/ButtonModel";
import {IWozCollectionModel, IWozProvider} from "../woz/model/Model";
import {IWozContent, WozModel} from "../woz/model/WozModel";
import {Woz} from "../woz/views/Woz";
import * as css from "../woz/views/woz.module.css";
import {IWozConnector} from "./connector/Connector";

enum WozState {
  LOADING,
  READY,
  FAILED,
}

export interface IWozCollectionState {
  connector: IWozConnector;
  error?: Error;
  regexResult?: string[];
  regexSearcher?: RegexSearcher;
  selectedScreenID?: string;
  selectedWoz?: WozModel;
  state?: WozState;
  allWozs?: IWozCollectionModel;
  provider: IWozProvider;
}

interface IWozCollectionProperties {
  state: IWozCollectionState;
  displayConfig?: (state: IWozCollectionState) => void;
}

export class WozCollection extends React.Component<IWozCollectionProperties, IWozCollectionState> {

  private coalescer: Coalescer;
  private readonly resultCount: number;

  constructor(props: IWozCollectionProperties) {
    super(props);

    this.coalescer = new Coalescer();
    this.state = props.state;

    this.resultCount = 8;
  }

  // noinspection JSUnusedGlobalSymbols
  public componentDidMount = () => {
    if (this.state.allWozs === undefined) {
      this._loadWozCollection();
      return;
    }

    const id = this.state.selectedWoz !== undefined
        ? this.state.selectedWoz.id : Object.keys(this.state.allWozs)[0];

    this._loadWozWithIDIfNeeded(this.state.allWozs, id);
  }

  public render() {

    if (this.state.state === undefined) {
      return (
          <div className={css.statusMessage}>
            {"WoZ UI is not loaded."}
          </div>
      );
    }

    if (this.state.allWozs === undefined) {
      return this._message("WoZ UI failed to load.", "Loading...");
    }

    const wozSelector = !this.state.selectedWoz || Object.keys(this.state.allWozs).length < 1
        ? null
        : this._wozSelectorComponent(this.state.allWozs, this.state.selectedWoz);

    const hasWoz = (this.state.state === WozState.READY
        && this.state.selectedWoz !== undefined);

    const searchField = hasWoz ? (
        <Input
            icon={{name: "search", circular: true, link: true}}
            className={css.searchField}
            onChange={(_event, data) => this._search(data.value, 100)}
            placeholder="Search..."/>) : null;

    const backButton = this.props.displayConfig === undefined
        ? null : (
            <SUIButton
                icon
                onClick={() => this.props.displayConfig!(this.state)}>
              <Icon name={"cogs"}/>
            </SUIButton>
        );

    const header = (
        <Container className={css.tableHeader} fluid>
          <Grid columns={2} verticalAlign={"middle"}>
            <Grid.Column floated="left">
              {searchField}
            </Grid.Column>
            <Grid.Column textAlign="right" floated="right">
              <div id={css.wozSelectorGroupId}>
                {wozSelector}
                {backButton}
              </div>
            </Grid.Column>
          </Grid>
        </Container>
    );

    const content = () => {
      if (this.state.state === WozState.READY
          && this.state.selectedWoz !== undefined) {
        return (
            <Woz
                onButtonClick={(buttonModel: IButtonModel) => {
                  this.state.connector.onButtonClick(buttonModel);
                }}
                didChangeScreen={(id) => {
                  this.setState({selectedScreenID: id});
                }}
                persistentRows={[{
                  buttons: this.state.regexResult,
                  id: "search_results",
                  label: "Search Results",
                }]}
                woz={this.state.selectedWoz}
                selectedScreenID={this.state.selectedScreenID}
            />
        );
      } else {
        const name = this.state.selectedWoz !== undefined ? this.state.selectedWoz.id : "unknown";
        return this._message("WoZ UI for \"" + name + "\" failed to load.",
            "Loading UI ", "for \"" + name + "\"...");
      }
    };

    return (
        <div className={css.searchableTable}>
          {header}
          {content()}
        </div>
    );
  }

  private _message = (failure: string, active: string, other: string = "") => {
    const content = (this.state.state === WozState.FAILED)
        ? failure + (this.state.error === undefined
        ? "" : " " + this.state.error.message)
        : <Loader
            className={css.statusMessage}
            active={true} size={"massive"}>{active}<span
            style={{
              fontSize: "inherit",
              whiteSpace: "nowrap",
            }}>{other}</span></Loader>;
    return (
        <div className={css.statusMessage}>
          {content}
        </div>
    );
  }

  private _wozSelectorComponent = (
      wozData: IWozCollectionModel,
      selectedWoz: WozModel) => {
    const allWozs = Object.values(wozData);
    allWozs.sort((a, b) => a.id.localeCompare(b.id));
    const options = arrayMap(allWozs, (woz) => {
      return {
        key: woz.id, text: woz.id, value: woz.id,
      };
    });

    return (
        <Dropdown
            placeholder="Select Country"
            className={css.wozSelectorDropdown}
            search selection
            allowAdditions={false}
            options={options}
            onChange={(
                _event: SyntheticEvent<HTMLElement>,
                data: DropdownProps) => {
              log.debug(data.value);
              if (this.state.allWozs === undefined) {
                return;
              }
              this._loadWozWithIDIfNeeded(
                  this.state.allWozs, data.value as string);
            }}
            value={selectedWoz.id}/>
    );
  }

  private _loadWozCollection = () => {
    this.setState(() => {
      return {
        state: WozState.LOADING,
      };
    });
    this.state.provider.loadWozCollection()
        .then((data: IWozCollectionModel) => {
              // log.debug(selectedWoz);
              this._loadWozWithIDIfNeeded(data, Object.keys(data)[0]);
            },
            (err) => {
              this._handleError(err);
            });
  }

  private _loadWozWithIDIfNeeded = (
      newData: IWozCollectionModel, newID?: string) => {

    if (newID === undefined) {
      this.setState({
        error: new Error("The WoZ UI is not defined."),
        regexSearcher: undefined,
        selectedScreenID: undefined,
        selectedWoz: undefined,
        state: WozState.FAILED,
      });
      return;
    }

    const woz = newData[newID];
    if (this.state.selectedWoz === woz) {
      return;
    }

    this.setState({
      allWozs: newData,
      error: undefined,
      regexSearcher: undefined,
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
          this.setState({
            regexSearcher: new RegexSearcher(data),
            selectedScreenID: firstScreen,
            selectedWoz: woz,
            state: WozState.READY,
          });
        },
        (error: Error) => {
          this._handleError(error);
        });
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
    this.coalescer.append(() => {
      const query = inText.trim();
      if (this.state.regexSearcher === undefined || query === "") {
        this.setState(() => {
          return {
            regexResult: undefined,
          };
        });
        return;
      }
      this.state.regexSearcher.search(query, this.resultCount)
          .then(this._didFindButtons);
    }, inDelay);
  }

  private _didFindButtons = (buttonList: string[]) => {
    this.setState(() => {
      return {
        regexResult: this._filterResults(buttonList),
      };
    });
  }

  // private _searchDelayed = (event: React.KeyboardEvent<HTMLInputElement>) =>
  // { if (event.keyCode === 13) { this._searchImmediately(event); } else {
  // this._search(event.currentTarget.value, 500); } }  private
  // _searchImmediately = (event: React.SyntheticEvent<HTMLInputElement>) => {
  // this._search(event.currentTarget.value, 0); }
}
