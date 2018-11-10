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
  regexSearcher: RegexSearcher
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
                const resultCount = this.props.resultCount === undefined
                                    ? 8 : this.props.resultCount

                const regexSearcher = new RegexSearcher(
                    data, resultCount,
                    (result) => this.setState((prevState) => {
                      if (prevState.kind === WOZ_SUCCEEDED) {
                        return { ...prevState, regexResult: result }
                      } else { return null }
                    }))

                this.setState({
                  currentScreenID,
                  currentWoz,
                  kind: WOZ_SUCCEEDED,
                  regexSearcher,
                  wozCollection,
                })
              })
              .catch((error) => this.setState({
                currentWoz, error, kind: WOZ_FAILED, wozCollection,
              }))
  }

  constructor(props: IWozCollectionProperties) {
    super(props)
    this.state = props.initialState
  }

  // noinspection JSUnusedGlobalSymbols
  public componentDidMount = () => {
    if (this.state.kind === COLLECTION_IS_LOADING) {
      const {dataSource, options} = this.state
      this._loadWozCollection(dataSource, options)
    } else if (this.state.kind === WOZ_IS_LOADING) {
      this._loadWoz(this.state.wozCollection, this.state.currentWoz)
    }
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

    let header: any = null
    let body: any = null

    const onWozChange = (currentWoz: WozModel) => {
      this._loadWoz(state.wozCollection, currentWoz)
    }

    const onBack = () => {
      if (this.props.onBack) {
        this.props.onBack(this.state)
      }
    }

    switch (state.kind) {
      case WOZ_SUCCEEDED:
        header = (
            <WozHeader
                allWozs={state.wozCollection.wozs}
                onChangeWoz={onWozChange}
                onBack={onBack}
                onSearch={state.regexSearcher.search}
                selectedWoz={state.currentWoz}
                ready={true}
            />
        )
        break
      default:
        header = (
            <WozHeader
                allWozs={state.wozCollection.wozs}
                onChangeWoz={onWozChange}
                onBack={onBack}
                onSearch={() => { /* nothing */ }}
                selectedWoz={state.currentWoz}
                ready={false}
            />
        )
    }

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
        body = (
            <Woz
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
        )
    }

    return (
        <div className={css.searchableTable}>
          {header}
          {body}
        </div>
    )
  }
}
