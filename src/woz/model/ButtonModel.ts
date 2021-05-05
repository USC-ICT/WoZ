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

export interface ICachedFontSize {
  fontSize?: number
}

export interface IButtonModel {
  id: string
  tooltip: string
  label: string
  transitions: { [index: string]: string }
  badges: { [index: string]: string }
  color?: string
  imageURL?: string

  [index: string]: any
}

export type MODEL = "MODEL"
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MODEL: MODEL = "MODEL"

export class ButtonModel implements IButtonModel, ICachedFontSize {
  public readonly kind: MODEL = MODEL

  public readonly id!: string

  public readonly tooltip!: string

  public readonly label!: string

  public fontSize?: number

  public readonly transitions!: { [index: string]: string }

  public readonly badges!: { [index: string]: string }

  constructor(model: IButtonModel) {
    Object.assign(this, model)
    this.fontSize = undefined
  }

  // public readonly color?: string;
  // public readonly imageURL?: string;
  readonly [index: string]: any;
}
