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
import {request} from "../../../common/util"
import {
  IWozCollectionModel,
  IWozDataSource,
  IWozLoadOptions,
} from "../../../woz/model/Model"
import {parseWorkbook} from "./ExcelParser"

// noinspection JSUnusedGlobalSymbols
export class ExcelURLDataSource implements IWozDataSource {
  private readonly url: string

  constructor(url: string) {
    this.url = url
    this.lastAccess = new Date()
  }

  public readonly lastAccess: Date

  // noinspection JSUnusedGlobalSymbols
  public loadWozCollection = async (
      options: IWozLoadOptions): Promise<IWozCollectionModel> => {
    const {workbook, title} = await spreadsheetWithURL(this.url)
    return parseWorkbook(workbook, title, options)
  }

  // noinspection JSUnusedLocalSymbols, JSUnusedGlobalSymbols
  public isEqual = (other?: IWozDataSource): boolean => {
    return this === other
  }

  public get id(): string {
    return this.url
  }

  public get title(): string {
    return this.url
  }
}

const spreadsheetWithURL = async (url: string) => {

  const arrayBuffer = await request<{}, ArrayBuffer>({
    headers: {},
    method: "GET",
    responseType: "arraybuffer",
    url,
  })

  const data = new Uint8Array(arrayBuffer)
  const arr = []
  for (let i = 0; i !== data.length; ++i) {
    arr[i] = String.fromCharCode(data[i])
  }
  const workbook = XLS.read(arr.join(""), {type: "binary"})
  return {workbook, title: url}
}

