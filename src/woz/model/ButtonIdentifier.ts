/*
 * Copyright 2020. University of Southern California
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

import {ButtonModel} from "./ButtonModel"
import {RowModel} from "./RowModel"
import {IWozContext} from "./WozModel"

export type ButtonIdentifier =
    ButtonPlaceholder | MissingButton | ButtonModel

type PLACEHOLDER = "PLACEHOLDER"
export const PLACEHOLDER: PLACEHOLDER = "PLACEHOLDER"

type MISSING = "MISSING"
export const MISSING: MISSING = "MISSING"

export class ButtonPlaceholder {
  public static readonly shared: ButtonPlaceholder = new ButtonPlaceholder()
  public readonly id: string = "__placeholder__"
  public readonly kind: PLACEHOLDER = PLACEHOLDER
}

// tslint:disable-next-line:max-classes-per-file
export class MissingButton {
  constructor(id: string) {
    this.id = id
  }

  public readonly id: string

  public readonly kind: MISSING = MISSING
}

export const buttonIdentifierInContext = (context: IWozContext, identifier: string): ButtonIdentifier => {
  const model = context.buttons[identifier]
  return (model === undefined)
         ? new MissingButton(identifier)
         : model

}

export type RowIdentifier = UndefinedRow | MissingRow | RowModel

type UNDEFINED = "UNDEFINED"
export const UNDEFINED: UNDEFINED = "UNDEFINED"

// tslint:disable-next-line:max-classes-per-file
export class UndefinedRow {
  public static readonly shared: UndefinedRow = new UndefinedRow()
  public readonly id: string = "__undefined__"
  public readonly kind: UNDEFINED = UNDEFINED
}

// tslint:disable-next-line:max-classes-per-file
export class MissingRow {
  constructor(id: string) {
    this.id = id
  }

  public readonly id: string

  public readonly kind: MISSING = MISSING
}

export const rowIdentifierInContext = (context: IWozContext, identifier: string): RowIdentifier => {
  const model = context.rows[identifier]
  return (model === undefined)
         ? new MissingRow(identifier)
         : model
}
