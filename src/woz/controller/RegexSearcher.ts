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
import {Searcher, SearchResultCallback} from "./Searcher"

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

export class RegexSearcher extends Searcher {

  constructor(
      data?: WozModel,
      resultCount: number = 8,
      callback?: SearchResultCallback) {
    super(data, resultCount, callback)
  }

  protected performSearch = async (query: string): Promise<string[]> => {
    if (this.data === undefined || query.length === 0) {
      return []
    }
    const regex = new RegExp(query, "gi")
    const results = util.objectCompactMap(this.data.buttons,
        ([id, bm]) => {
          // log.debug(id, bm);
          return _button_matches_query(bm, regex) ? id : undefined
        }).slice(0, this.resultCount)
    return results
  }
}
