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
import {log} from "../../common/Logger"
import {RegexSearcher} from "../controller/RegexSearcher"
import {IButtonModel} from "../model/ButtonModel"
import {
  IWozCollectionModel,
  IWozDataSource,
  IWozLoadOptions,
} from "../model/Model"
import {IWozContent, WozModel} from "../model/WozModel"
import {ErrorMessage} from "./ErrorMessage"
import {LoadingMessage} from "./LoadingMessage"
import {Woz} from "./Woz"
import css from "./woz.module.css"
import {WozHeader} from "./WozHeader"

export type ButtonClickCallback = (buttonModel: IButtonModel) => void

export interface IWozCollectionProperties {
  initialState: WozCollectionState
  onBack?: (state: WozCollectionState) => void
  resultCount?: number
  onButtonClick: ButtonClickCallback
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
  regexResult?: string[]
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

export const collectionLoading = (args: ILoadingCollection): CollectionLoading => {
  return {kind: COLLECTION_IS_LOADING, ...args}
}

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

export class WozCollection
    extends React.Component<IWozCollectionProperties, WozCollectionState> {

  private readonly regexSearcher: RegexSearcher

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

                this.regexSearcher.data = currentWoz

                this.setState({
                  currentScreenID,
                  currentWoz,
                  kind: WOZ_SUCCEEDED,
                  regexResult: undefined,
                  wozCollection,
                })
              })
              .catch((error) => this.setState({
                currentWoz, error, kind: WOZ_FAILED, wozCollection,
              }))
  }

  constructor(props: IWozCollectionProperties) {
    super(props)
    this.regexSearcher = new RegexSearcher()
    this.regexSearcher.resultCount = this.props.resultCount === undefined
                                     ? 8 : this.props.resultCount
    this.state = props.initialState
  }

  // noinspection JSUnusedGlobalSymbols
  public componentDidMount = () => {
    this.regexSearcher.callback =
        (regexResult) => this.setState((prevState) => {
          if (prevState.kind === WOZ_SUCCEEDED) {
            return {...prevState, regexResult}
          } else { return null }
        })
    switch (this.state.kind) {
      case COLLECTION_IS_LOADING:
        const {dataSource, options} = this.state
        this._loadWozCollection(dataSource, options)
        break
      case WOZ_IS_LOADING:
        this._loadWoz(this.state.wozCollection, this.state.currentWoz)
        break
      case WOZ_SUCCEEDED:
        this.regexSearcher.data = this.state.currentWoz
        // clear the search results on load
        this.setState((prev) => {
          // @ts-ignore
          // noinspection JSUnusedLocalSymbols
          const {regexResult, ...other} = prev
          return other
        })
        break
    }
  }

  // noinspection JSUnusedGlobalSymbols
  public componentWillUnmount = () => {
    this.regexSearcher.callback = undefined
  }

  public render = () => {
    const state = this.state

    switch (state.kind) {
      case COLLECTION_IS_LOADING:
        return (<LoadingMessage message={"Loading..."}/>)
      case COLLECTION_FAILED:
        return (<ErrorMessage message={"WoZ UI failed to load."}
                              error={state.error}/>)
    }

    const onWozChange = (currentWoz: WozModel) => {
      this._loadWoz(state.wozCollection, currentWoz)
    }

    const onBack = () => {
      if (this.props.onBack) {
        // @ts-ignore
        // noinspection JSUnusedLocalSymbols
        const {regexResult, ...rest} = this.state
        this.props.onBack(rest)
      }
    }

    const onSearch = state.kind === WOZ_SUCCEEDED
                     ? this.regexSearcher.search : undefined

    const header = <WozHeader
        allWozs={state.wozCollection.wozs}
        onChangeWoz={onWozChange}
        onBack={onBack}
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
            persistentRows={[
              {
                buttons: state.regexResult,
                id: "search_results",
                label: "Search Results",
              },
            ]}
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
