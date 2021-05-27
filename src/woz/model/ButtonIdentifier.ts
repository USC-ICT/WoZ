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
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const PLACEHOLDER: PLACEHOLDER = "PLACEHOLDER"

type MISSING = "MISSING"
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MISSING: MISSING = "MISSING"

export class ButtonPlaceholder {
  public static readonly shared: ButtonPlaceholder = new ButtonPlaceholder()
  public readonly id: string = "__placeholder__"
  public readonly kind: PLACEHOLDER = PLACEHOLDER
}

// tslint:disable-next-line:max-classes-per-file
export class MissingButton {
  public readonly id: string

  public readonly kind: MISSING = MISSING

  constructor(id: string) {
    this.id = id
  }
}

export const buttonIdentifierInContext = (context: IWozContext, identifier: string): ButtonIdentifier => {
  return (identifier in context.buttons)
         ? context.buttons[identifier]
         : new MissingButton(identifier)
}

export type RowIdentifier = UndefinedRow | MissingRow | RowModel

type UNDEFINED = "UNDEFINED"
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UNDEFINED: UNDEFINED = "UNDEFINED"

// tslint:disable-next-line:max-classes-per-file
export class UndefinedRow {
  public static readonly shared: UndefinedRow = new UndefinedRow()
  public readonly id: string = "__undefined__"
  public readonly kind: UNDEFINED = UNDEFINED
}

// tslint:disable-next-line:max-classes-per-file
export class MissingRow {
  public readonly id: string

  public readonly kind: MISSING = MISSING

  constructor(id: string) {
    this.id = id
  }
}

export const rowIdentifierInContext = (context: IWozContext, identifier: string): RowIdentifier => {
  return (identifier in context.rows)
         ? context.rows[identifier]
         : new MissingRow(identifier)
}
