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
export class ExcelFileDataSource implements IWozDataSource {

  public get id(): string {
    return this.file.name
  }

  public get title(): string {
    return this.file.name
  }

  public get props(): { [index: string]: string } {
    return {}
  }

  constructor(file: File) {
    this.file = file
    this.lastAccess = new Date()
  }

  public get shouldPersist(): boolean { return false }

  private readonly file: File

  public readonly lastAccess: Date

  // noinspection JSUnusedGlobalSymbols
  public loadWozCollection = async (
      options: IWozLoadOptions): Promise<IWozCollectionModel> => {
    const workbook = await spreadsheetWithFile(this.file)
    return parseWorkbook(workbook, this.title, options)
  }

  // noinspection JSUnusedLocalSymbols, JSUnusedGlobalSymbols
  public isEqual = (other?: IWozDataSource): boolean => {
    return this === other
  }
}

const spreadsheetWithFile = (file: File) => {
  return new Promise<any>(
      (resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
          const workbook = XLS.read(reader.result, {type: "binary"})
          resolve(workbook)
        }

        reader.onerror = reject

        reader.readAsBinaryString(file)
      })
}
