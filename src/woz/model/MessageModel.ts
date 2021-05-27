/*
 * Copyright 2019. University of Southern California
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

import * as uuid from "uuid"
import {PartialBy} from "../../common/util"

export interface IMessage {
  id: string
  text: string
  time: Date
  userID?: string
}

export const ourUserID = "us"

export type IMessageArgument = PartialBy<IMessage, "time" | "id">

export class Message implements IMessage {
  // noinspection JSUnusedGlobalSymbols
  public readonly id!: string
  // noinspection JSUnusedGlobalSymbols
  public readonly text!: string
  // noinspection JSUnusedGlobalSymbols
  public readonly time!: Date
  // noinspection JSUnusedGlobalSymbols
  public readonly userID?: string

  constructor(argument: IMessageArgument | Date) {
    if (argument instanceof Date) {
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        month: "numeric",
        second: "numeric",
        year: "numeric",
      }
      // disabling inspection due to a bug in Intellij type checking
      // https://youtrack.jetbrains.com/issue/WEB-36766
      // noinspection TypeScriptValidateTypes
      Object.assign(this, {
        id: uuid.v4(),
        text: new Intl.DateTimeFormat(undefined, options).format(argument),
        time: new Date(),
      })
    } else {
      // disabling inspection due to a bug in Intellij type checking
      // https://youtrack.jetbrains.com/issue/WEB-36766
      // noinspection TypeScriptValidateTypes
      Object.assign(this, {
        id: uuid.v4(),
        time: new Date(),
        ...argument,
      })
    }
  }
}

