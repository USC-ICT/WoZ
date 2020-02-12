/*
 * Copyright 2018. University of Southern California
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react"
import {Button} from "semantic-ui-react"
import {log} from "../../common/Logger"
import {arrayMap, objectMap} from "../../common/util"
import {LunrSearcher} from "../controller/LunrSearcher"
import {MetaSearcher} from "../controller/MetaSearcher"
import {RegexSearcher} from "../controller/RegexSearcher"
import {ISearcher, ISearchResult, ISearchResults} from "../controller/Searcher"
import {
  ButtonIdentifier,
  ButtonPlaceholder,
  RowIdentifier, UndefinedRow,
} from "../model/ButtonIdentifier"
import {IButtonModel} from "../model/ButtonModel"
import {
  IWozCollectionModel,
  IWozDataSource,
  IWozLoadOptions,
} from "../model/Model"
import {RowModel} from "../model/RowModel"
import {IWozContent, IWozContext, WozModel} from "../model/WozModel"
import {ErrorMessage} from "./ErrorMessage"
import {LoadingMessage} from "./LoadingMessage"
import {Woz} from "./Woz"
import css from "./woz.module.css"
import {WozHeader} from "./WozHeader"

export type ButtonClickCallback = (buttonModel: IButtonModel) => void

export interface IWozCollectionProperties {
  initialState: WozCollectionState
  onBack?: (state: WozCollectionState) => void
  onCopyURL?: (id: string) => void
  resultCount?: number
  onButtonClick: ButtonClickCallback
  onMount?: () => void
  onUnmount?: (state: WozCollectionState) => void
  onError?: () => void
}

interface ILoadingCollection {
  dataSource: IWozDataSource
  options: IWozLoadOptions
}

interface ILoadedCollection {
  wozCollection: IWozCollectionModel
  currentWoz: WozModel
}

interface ILoadedWoz {
  searchResults?: ISearchResults[]
  currentScreenID: string
}

interface IError {
  error: Error,
}

type COLLECTION_IS_LOADING = "collection loading"
const COLLECTION_IS_LOADING: COLLECTION_IS_LOADING = "collection loading"

type COLLECTION_FAILED = "collection failed"
const COLLECTION_FAILED: COLLECTION_FAILED = "collection failed"

type WOZ_IS_LOADING = "collection succeeded"
const WOZ_IS_LOADING: WOZ_IS_LOADING = "collection succeeded"

type WOZ_FAILED = "woz failed"
const WOZ_FAILED: WOZ_FAILED = "woz failed"

type WOZ_SUCCEEDED = "woz succeeded"
const WOZ_SUCCEEDED: WOZ_SUCCEEDED = "woz succeeded"

export type WozCollectionState = CollectionLoading | CollectionLoadFailure
    | CollectionLoadSuccess | WozLoadFailure | WozLoadSuccess

// noinspection JSUnusedGlobalSymbols
export const collectionLoading = (args: ILoadingCollection): CollectionLoading => {
  return {kind: COLLECTION_IS_LOADING, ...args}
}

// noinspection JSUnusedGlobalSymbols
export const wozLoading = (args: ILoadedCollection): CollectionLoadSuccess => {
  return {kind: WOZ_IS_LOADING, ...args}
}

type CollectionLoading = { kind: COLLECTION_IS_LOADING }
    & ILoadingCollection
type CollectionLoadFailure = { kind: COLLECTION_FAILED }
    & IError
type CollectionLoadSuccess = { kind: WOZ_IS_LOADING }
    & ILoadedCollection
type WozLoadFailure = { kind: WOZ_FAILED }
    & ILoadedCollection & IError
type WozLoadSuccess = { kind: WOZ_SUCCEEDED }
    & ILoadedCollection & ILoadedWoz

// noinspection JSUnusedGlobalSymbols
export class WozCollection
    extends React.Component<IWozCollectionProperties, WozCollectionState> {

  constructor(props: IWozCollectionProperties) {
    super(props)
    this.searcher = new MetaSearcher({
      searchers: [new LunrSearcher(), new RegexSearcher()],
    })
    this.state = props.initialState
  }

  private readonly searcher: ISearcher

  private _isMounted: boolean = false

  private get _searchResultCount(): number {
    return this.props.resultCount === undefined
           ? 8 : this.props.resultCount
  }

  private _searchCallback = (results?: ISearchResults) => {
    if (!this._isMounted || results === undefined || this.state.kind
        !== WOZ_SUCCEEDED) { return }

    this.setState((prev) => {
      if (prev.kind === WOZ_SUCCEEDED) {
        const {searchResults, ...other} = prev
        const newResults = searchResults === undefined ? [] : searchResults
        newResults.push(results)
        return {...other, searchResults: newResults}
      } else { return null }
    })
  }

  private _filterButtons = (value: ISearchResults): ButtonIdentifier[] => {
    let buttonIDs = arrayMap(value.results,
        (value1: ISearchResult) => value1.buttonID)

    if (buttonIDs.length > this._searchResultCount) {
      buttonIDs = buttonIDs.slice(0, this._searchResultCount)
    }

    while (buttonIDs.length < this._searchResultCount) {
      buttonIDs.push(ButtonPlaceholder.shared)
    }

    return buttonIDs
  }

  private _onSearch = (query: string) => {
    if (this.state.kind !== WOZ_SUCCEEDED) { return }
    this.setState((prev) => {
      // @ts-ignore
      // noinspection JSUnusedLocalSymbols
      const {searchResults, ...other} = prev
      return {...other, searchResults: undefined}
    })

    this.searcher.search({
      callback: this._searchCallback,
      data: this.state.currentWoz,
      query,
      resultCount: this._searchResultCount,
    })
  }

  private _loadWozCollection = (
      dataSource: IWozDataSource, options: IWozLoadOptions) => {
    dataSource.loadWozCollection(options)
              .then((wozCollection: IWozCollectionModel) => {
                const currentWoz = Object.values(wozCollection.wozs)[0]
                if (currentWoz === undefined) {
                  throw new Error("No Wozs in the Woz collection.")
                }
                this._loadWoz(wozCollection, currentWoz)
              })
              .catch((error) => this.setState({
                error, kind: COLLECTION_FAILED,
              }))
  }

  private _loadWoz = (
      wozCollection: IWozCollectionModel,
      currentWoz: WozModel) => {

    this.setState(wozLoading({currentWoz, wozCollection}))

    log.debug("will load " + currentWoz.id)

    currentWoz.loadContent()
              .then((data: IWozContent) => {
                const screenKeys = Object.keys(data.screens)
                if (screenKeys.length === 0) {
                  throw new Error("No screens in WoZ")
                }
                const currentScreenID = screenKeys[0]

                this.setState({
                  currentScreenID,
                  currentWoz,
                  kind: WOZ_SUCCEEDED,
                  searchResults: undefined,
                  wozCollection,
                })
              })
              .catch((error) => this.setState({
                currentWoz, error, kind: WOZ_FAILED, wozCollection,
              }))
  }

  private _rowsForButtons = (
      context: IWozContext,
      buttons: ButtonIdentifier[]): RowIdentifier[] => {
    const buttonIndex: {[index: string]: RowModel} = Object.assign({},
        ...objectMap(context.rows, ([_rowID, rowModel]) => {
          return arrayMap(
              rowModel.buttons, (buttonID: string) => ({[buttonID]: rowModel}))
        }).flat())

    return arrayMap(buttons, (buttonID): RowIdentifier => {
      const model = buttonIndex[buttonID.id]
      return model === undefined ? UndefinedRow.shared : model
    })
  }

  private _searchRows = (state: WozLoadSuccess) => {
    if (state.searchResults === undefined) {
      return []
    }

    return arrayMap(state.searchResults,
        (value: ISearchResults, index) => {
          const buttons = this._filterButtons(value)
          const rows = this._rowsForButtons(state.currentWoz, buttons)
          return {
            buttons, id: "search_results " + index,
            label: value.engineName, rows,
          }
        })
  }

  // noinspection JSUnusedGlobalSymbols
  public componentDidMount = () => {
    this._isMounted = true
    switch (this.state.kind) {
      case COLLECTION_IS_LOADING:
        const {dataSource, options} = this.state
        this._loadWozCollection(dataSource, options)
        break
      case WOZ_IS_LOADING:
        this._loadWoz(this.state.wozCollection, this.state.currentWoz)
        break
      case WOZ_SUCCEEDED:
        // clear the search results on load
        this.setState((prev) => {
          // @ts-ignore
          // noinspection JSUnusedLocalSymbols
          const {searchResults, ...other} = prev
          return {...other, searchResults: undefined}
        })
        break
    }
    if (this.props.onMount !== undefined) {
      this.props.onMount()
    }
  }

  // noinspection JSUnusedGlobalSymbols
  public componentWillUnmount = () => {
    this._isMounted = false
    if (this.props.onUnmount !== undefined) {
      this.props.onUnmount(this.state)
    }
  }

  public render = () => {
    const state = this.state
    switch (state.kind) {
      case COLLECTION_IS_LOADING:
        return (<LoadingMessage message={"Loading..."}/>)
      case COLLECTION_FAILED:
        return <div>
          <ErrorMessage message={"WoZ UI failed to load."}
                        error={state.error}/>
          <div style={{textAlign: "center"}}>
            <Button onClick={this.props.onError}>OK</Button>
          </div>
        </div>
    }

    const onWozChange = (currentWoz: WozModel) => {
      this._loadWoz(state.wozCollection, currentWoz)
    }

    const onBack = () => {
      if (this.props.onBack) {
        // @ts-ignore
        // noinspection JSUnusedLocalSymbols
        const {searchResults, ...rest} = this.state
        this.props.onBack(rest)
      }
    }

    const _onCopyURL = (this.props.onCopyURL !== undefined) ? () => {
      // @ts-ignore
      this.props.onCopyURL(state.currentWoz.id)
    } : undefined

    const onSearch = state.kind === WOZ_SUCCEEDED ? this._onSearch : undefined

    const header = <WozHeader
        allWozs={state.wozCollection.wozs}
        onChangeWoz={onWozChange}
        onBack={onBack}
        onCopyURL={_onCopyURL}
        onSearch={onSearch}
        selectedWoz={state.currentWoz}
    />

    let body: any = null
    switch (state.kind) {
      case WOZ_IS_LOADING:
        body = <LoadingMessage
            message={"Loading UI "}
            detail={`for "${state.currentWoz.id}"...`}/>
        break
      case WOZ_FAILED:
        body = <ErrorMessage
            message={`WoZ UI for "${state.currentWoz.id}" failed to load.`}
            error={state.error}/>
        break
      case WOZ_SUCCEEDED:
        const onScreenChange = (screenID: string) => {
          this.setState((prev) => {
            return {...prev, currentScreenID: screenID}
          })
        }

        body = <Woz
            onButtonClick={this.props.onButtonClick}
            onScreenChange={onScreenChange}
            persistentRows={this._searchRows(state)}
            woz={state.currentWoz}
            selectedScreenID={state.currentScreenID}
        />
    }

    return (
        <div className={css.searchableTable}>
          {header}
          {body}
        </div>
    )
  }
}
