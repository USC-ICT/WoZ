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

import {Coalescer} from "../../common/Coalescer"
import * as util from "../../common/util"
import {ButtonModel} from "../model/ButtonModel"
import {IWozContent} from "../model/WozModel"
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

  private readonly data: IWozContent
  private readonly resultCount: number
  private readonly callback: SearchCallback
  private readonly coalescer: Coalescer = new Coalescer()

  private _didFindButtons = (buttonList: string[]) => {
    this.callback(this._filterResults(buttonList))
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

    if (inQuery.length !== 0) {
      const regex = new RegExp(inQuery, "gi")
      result = util.objectCompactMap(this.data.buttons, ([id, bm]) => {
        // log.debug(id, bm);
        return _button_matches_query(bm, regex) ? id : undefined
      }).slice(0, inMaxResultCount)
    }
    return result
  }

  constructor(
      inData: IWozContent,
      resultCount: number,
      callback: SearchCallback) {
    this.data = inData
    this.resultCount = resultCount
    this.callback = callback
  }

  public search = (inText: string, inDelay: number = 100) => {
    this.coalescer.append(() => {
      const query = inText.trim()
      if (query === "") {
        this.callback(undefined)
        return
      }
      this._search(query, this.resultCount)
          .then(this._didFindButtons)
    }, inDelay)
  }

}
