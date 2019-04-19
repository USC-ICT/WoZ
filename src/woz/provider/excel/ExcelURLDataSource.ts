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

interface IExcelURLDataSource {
  lastAccess?: Date
  url: string
  title?: string
}

// noinspection JSUnusedGlobalSymbols
export class ExcelURLDataSource implements IWozDataSource {

  public get id(): string {
    return this.url
  }

  constructor(args: IExcelURLDataSource) {
    this.url = args.url
    this.lastAccess = args.lastAccess || new Date()
    if (args.title === undefined) {
      const parts = this.url.split("/")
      this.title = parts[parts.length - 1]
    } else {
      this.title = args.title
    }
  }

  public get shouldPersist(): boolean { return true }

  private readonly url: string

  public title: string

  public readonly lastAccess: Date

  // noinspection JSUnusedGlobalSymbols
  public loadWozCollection = async (
      options: IWozLoadOptions): Promise<IWozCollectionModel> => {
    const workbook = await spreadsheetWithURL(this.url)
    return parseWorkbook(workbook, this.title, options)
        .then((data) => {
          this.title = data.title
          return data
        })
  }

  // noinspection JSUnusedLocalSymbols, JSUnusedGlobalSymbols
  public isEqual = (other?: IWozDataSource): boolean => {
    return this === other
  }
}

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

