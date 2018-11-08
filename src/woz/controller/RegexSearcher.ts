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
import {IWozContent} from "../model/WozModel"

// import {log} from "./Logger";

export class RegexSearcher {

  public static _button_matches_query(
      inButtonModel: ButtonModel, inRegex: RegExp): boolean {
    for (const badge of Object.values(inButtonModel.badges)) {
      if (badge.search(inRegex) >= 0) {
        return true
      }
    }

    return inButtonModel.tooltip.search(inRegex) >= 0
        || inButtonModel.label.search(inRegex) >= 0
  }

  private data: IWozContent

  constructor(inData: IWozContent) {
    this.data = inData
  }

  public search = async (inQuery: string, inMaxResultCount: number): Promise<string[]> => {
    let result: string[] = []

    if (inQuery.length !== 0) {
      const regex = new RegExp(inQuery, "gi")
      result = util.objectCompactMap(this.data.buttons, ([id, bm]) => {
        // log.debug(id, bm);
        return RegexSearcher._button_matches_query(bm, regex) ? id : undefined
      }).slice(0, inMaxResultCount)
    }
    return result
  }

}
