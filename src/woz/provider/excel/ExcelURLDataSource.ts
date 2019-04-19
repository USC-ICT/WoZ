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

import * as XLS from "xlsx"
import {
  IWozCollectionModel,
  IWozDataSource,
  IWozLoadOptions,
} from "../../model/Model"
import {parseWorkbook} from "./ExcelParser"

// noinspection JSUnusedGlobalSymbols
export class ExcelURLDataSource implements IWozDataSource {

  public get id(): string {
    return this.url
  }

  constructor(url: string, title?: string) {
    this.url = url
    this.lastAccess = new Date()
    if (title === undefined) {
      const parts = url.split("/")
      this.title = parts[parts.length - 1]
    } else {
      this.title = title
    }
  }

  private readonly url: string

  public readonly title: string

  public readonly lastAccess: Date

  // noinspection JSUnusedGlobalSymbols
  public loadWozCollection = async (
      options: IWozLoadOptions): Promise<IWozCollectionModel> => {
    const workbook = await spreadsheetWithURL(this.url)
    return parseWorkbook(workbook, this.title, options)
  }

  // noinspection JSUnusedLocalSymbols, JSUnusedGlobalSymbols
  public isEqual = (other?: IWozDataSource): boolean => {
    return this === other
  }
}

// const spreadsheetWithURL = async (url: string) => {
//
//   const arrayBuffer = await request<{}, ArrayBuffer>({
//     headers: {},
//     method: "GET",
//     responseType: "arraybuffer",
//     url,
//   })
//
//   return XLS.read(arrayBuffer, {type: "buffer"})
// }

const spreadsheetWithURL = (url: string) => {
  return fetch(url)
      .then((response) => {
        console.log(response)
        if (!response.ok) {
          throw new Error("read failed from \"" + url + "\"")
        }
        return response.arrayBuffer()
      })
      .then((arrayBuffer) => {
        return XLS.read(arrayBuffer, {type: "buffer"})
      })
}

