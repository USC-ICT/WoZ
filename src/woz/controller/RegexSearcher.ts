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
import {arrayMap} from "../../common/util"
import {buttonIdentifierInContext} from "../model/ButtonIdentifier"
import {ButtonModel} from "../model/ButtonModel"
import {ISearchRequest, ISearchResult, Searcher} from "./Searcher"

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

  // eslint-disable-next-line @typescript-eslint/require-await
  protected performSearch = async (request: ISearchRequest): Promise<ISearchResult[] | undefined> => {
    if (request.data === undefined || request.query.trim().length === 0) {
      return undefined
    }
    const regex = new RegExp(request.query, "gi")
    const results = util.objectCompactMap(request.data.buttons,
        ([id, bm]) => {
          // log.debug(id, bm);
          return _button_matches_query(bm, regex) ? id : undefined
        }).slice(0, request.resultCount)
    return arrayMap(results,
        (value) => ({buttonID: buttonIdentifierInContext(request.data, value)}))
  }

  constructor() {
    super("Regex Search")
  }
}
