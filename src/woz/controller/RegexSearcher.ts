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

import * as util from "../../common/util"
import {ButtonModel} from "../model/ButtonModel"
import {WozModel} from "../model/WozModel"
import {Button} from "../views/Button"

const _button_matches_query = (
    inButtonModel: ButtonModel, inRegex: RegExp): boolean => {
  for (const badge of Object.values(inButtonModel.badges)) {
    if (badge.search(inRegex) >= 0) {
      return true
    }
  }

  return inButtonModel.tooltip.search(inRegex) >= 0
         || inButtonModel.label.search(inRegex) >= 0
}

export type SearchCallback = (buttons?: string[]) => void

export class RegexSearcher {

  constructor(
      data?: WozModel,
      resultCount: number = 8,
      callback?: SearchCallback) {
    this.data = data
    this.resultCount = resultCount
    this.callback = callback
  }

  private _callback: SearchCallback = (buttons?: string[]) => {
    if (this.callback !== undefined) {
      this.callback(buttons)
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

  private _search = async (
      inQuery: string,
      inMaxResultCount: number): Promise<string[]> => {
    let result: string[] = []

    if (this.data !== undefined && inQuery.length !== 0) {
      const regex = new RegExp(inQuery, "gi")
      result = util.objectCompactMap(this.data.buttons, ([id, bm]) => {
        // log.debug(id, bm);
        return _button_matches_query(bm, regex) ? id : undefined
      }).slice(0, inMaxResultCount)
    }
    return result
  }

  public data?: WozModel

  public resultCount: number

  public callback?: SearchCallback

  // noinspection JSUnusedGlobalSymbols
  public search = (inText: string) => {
    const query = inText.trim()
    if (query === "") {
      this._callback(undefined)
      return
    }
    this._search(query, this.resultCount)
        .then(this._didFindButtons)
        .catch(() => this._callback(undefined))
  }

}
