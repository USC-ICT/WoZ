/*
 * Copyright 2019. University of Southern California
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

import {WozModel} from "../model/WozModel"
import {Button} from "../views/Button"

export type SearchResultCallback = (buttons?: string[]) => void

export class Searcher {

  constructor(
      data?: WozModel,
      resultCount: number = 8,
      resultCallback?: SearchResultCallback) {
    this.data = data
    this.resultCount = resultCount
    this.resultCallback = resultCallback
  }

  private _callback: SearchResultCallback = (buttons?: string[]) => {
    if (this.resultCallback !== undefined) {
      this.resultCallback(buttons)
    }
  }

  private _didFindButtons = (buttonList: string[]) => {
    this._callback(this._filterResults(buttonList))
  }

  private _filterResults = (inResultArray?: string[]): string[] | undefined => {
    if (inResultArray === undefined || inResultArray.length === 0) {
      return undefined
    }

    let resultArray = inResultArray

    if (resultArray.length > this.resultCount) {
      resultArray = resultArray.slice(0, this.resultCount)
    }

    while (resultArray.length < this.resultCount) {
      resultArray.push(Button.placeholderID)
    }

    return resultArray
  }

  protected performSearch = async (_query: string): Promise<string[]> => {
    return []
  }

  public data?: WozModel

  public resultCount: number

  public resultCallback?: SearchResultCallback

  // noinspection JSUnusedGlobalSymbols
  public search = (inText: string) => {
    const query = inText.trim()
    if (query === "") {
      this._callback(undefined)
      return
    }
    this.performSearch(query)
        .then(this._didFindButtons)
        .catch(() => this._callback(undefined))
  }

}
