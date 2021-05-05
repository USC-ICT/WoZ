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

export interface IScreenModel {
  readonly id: string
  readonly label: string
  readonly rows: string[]
}

export class ScreenModel implements IScreenModel {
  public readonly id: string

  public readonly label: string

  public readonly rows: string[]

  constructor(model: IScreenModel) {
    this.id = model.id
    this.label = model.label
    this.rows = model.rows
  }
}
