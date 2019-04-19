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

import {WozModel} from "./WozModel"

export interface IWozCollectionModel {
  title: string
  wozs: { [index: string]: WozModel }
}

export interface IWozLoadOptions {
  generateTabs: boolean
}

export interface IWozDataSource {
  readonly shouldPersist: boolean
  readonly id: string
  readonly title: string
  lastAccess: Date
  loadWozCollection: (options: IWozLoadOptions) => Promise<IWozCollectionModel>
  isEqual: (other?: IWozDataSource) => boolean
}
