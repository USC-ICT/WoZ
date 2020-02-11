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

export interface ISearchResult {
  buttonID: string
}

export interface ISearchResults {
  engineName: string
  results: ISearchResult[]
}

export interface ISearchRequest {
  query: string
  data: WozModel
  resultCount: number
  callback: SearchResultCallback
}

export type SearchResultCallback = (results?: ISearchResults) => void

export interface ISearcher {
  readonly name: string
  search: (request: ISearchRequest) => void
}

export class Searcher implements ISearcher {

  constructor(
      name: string) {
    this.name = name
  }

  private _filterResults = (inResultArray: ISearchResult[]): ISearchResults | undefined => {
    if (inResultArray.length === 0) {
      return undefined
    }

    return {
      engineName: this.name,
      results: inResultArray,
    }
  }

  protected performSearch = async (_request: ISearchRequest): Promise<ISearchResult[] | undefined> => {
    return []
  }

  public readonly name: string

  // noinspection JSUnusedGlobalSymbols
  public search = (request: ISearchRequest) => {
    const query = request.query.trim()
    if (query === "") {
      request.callback(undefined)
      return
    }
    this.performSearch(request)
        .then((results) => {
          if (results === undefined) {
            request.callback(undefined)
            return
          }
          request.callback(this._filterResults(results))
        })
        .catch(() => request.callback(undefined))
  }

}
