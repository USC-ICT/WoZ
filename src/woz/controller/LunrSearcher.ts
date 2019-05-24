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

import * as lunr from "lunr"
import {log} from "../../common/Logger"
import {WozModel} from "../model/WozModel"
import {Searcher, SearchResultCallback} from "./Searcher"

export class LunrSearcher extends Searcher {
  constructor(
      data?: WozModel,
      resultCount: number = 8,
      callback?: SearchResultCallback) {
    super(data, resultCount, callback)
  }

  private _data?: WozModel

  private _index?: lunr.Index

  public get data(): WozModel | undefined {
    return this._data
  }

  public set data(value: WozModel | undefined) {
    if (this._data !== value) {
      this._index = undefined
    }
    this._data = value
  }

  public get index(): lunr.Index | undefined {
    if (this._index !== undefined) { return this._index }
    const data = this.data
    if (data === undefined) { return undefined }

    const builder = new lunr.Builder()
    builder.pipeline.add(lunr.trimmer, lunr.stemmer)

    builder.searchPipeline.add(lunr.stemmer)

    builder.field("label")
    builder.field("tooltip")

    Object.keys(data.buttons).forEach((key) => {
      builder.add(data.buttons[key])
    })

    this._index = builder.build()
    return this._index
  }

  protected performSearch = async (query: string): Promise<string[]> => {
    if (query.length === 0
        || this.index === undefined) {
      return []
    }
    return this.index.search(query).map((value, index) => {
      log.debug(index, value)
      return value.ref
    })
  }

}

