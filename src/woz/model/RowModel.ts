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

import {ButtonIdentifier, RowIdentifier} from "./ButtonIdentifier"
import {MODEL} from "./ButtonModel"

export interface IRowModel {
  readonly id: string
  readonly label: string
  readonly buttons?: string[]
}

export interface IPersistentRowModel {
  readonly id: string
  readonly label: string
  readonly buttons: ButtonIdentifier[]
  readonly rows: RowIdentifier[]
}

export class RowModel implements IRowModel {
  public readonly kind: MODEL = MODEL

  public readonly id: string

  public readonly label: string

  public readonly buttons: string[]

  constructor(model: IRowModel) {
    this.id = model.id
    this.label = model.label
    this.buttons = model.buttons === undefined ? [] : model.buttons
  }
}
