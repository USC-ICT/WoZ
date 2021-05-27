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

import {IMessage, Message} from "./MessageModel"

export interface IDialogue {
  messages: IMessage[]
}

export class Dialogue implements IDialogue {
  // noinspection JSUnusedGlobalSymbols
  public messages!: IMessage[]

  constructor(model: IDialogue) {
    // disabling inspection due to a bug in Intellij type checking
    // https://youtrack.jetbrains.com/issue/WEB-36766
    // noinspection TypeScriptValidateTypes
    Object.assign(this, model)
  }

  public hasMessage = (message: Message): boolean => {
    return undefined !== this.messages.find(
        (existingMessage) => (existingMessage.id === message.id))
  }

  public appending = (message: Message, durationBetweenDatesInSec: number): Dialogue => {
    // if the message with this ID exists, do not add it
    if (this.hasMessage(message)) {
      return this
    }

    const messages: Message[] = [message]
    const time = message.time
    if (this.messages.length !== 0 && durationBetweenDatesInSec !== 0) {
      const lastMessageTime = this.messages[this.messages.length - 1].time
      if (lastMessageTime.getTime()
          < (time.getTime() - durationBetweenDatesInSec * 1000)) {
        messages.unshift(new Message(time))
      }
    }
    return new Dialogue({
      messages: this.messages.concat(messages),
    })
  }
}

export const US = "us"
export const THEM = "them"

// noinspection SpellCheckingInspection,JSUnusedGlobalSymbols
export const sampleDialogue = (): Dialogue => new Dialogue({messages: [
    new Message({text: "Begin"}),
    new Message({userID: "them", text: "Hello"}),
    new Message({userID: US, text: "How are you"}),
    new Message({userID: THEM, text: "I'm well"}),
    new Message({text: "More chat"}),
    new Message({userID: US,
      // tslint:disable-next-line:object-literal-sort-keys
      text: "Your bones don't break, mine do. That's clear. Your cells "
            + "react to bacteria and viruses differently than mine. "
            + "You don't get sick, I do. That's also clear. But for some "
            + "reason, you and I react the exact same way to water. We "
            + "swallow it too fast, we choke. We get some in our lungs, "
            + "we drown. However unreal it may seem, we are connected, "
            + "you and I. We're on the same curve, just on opposite ends."}),
    new Message({userID: THEM,
      // tslint:disable-next-line:object-literal-sort-keys
      text: "You think water moves fast? You should see ice. It moves like "
            + "it has a mind. Like it knows it killed the world once and "
            + "got a taste for murder. After the avalanche, it took us a "
            + "week to climb out. Now, I don't know exactly when we turned "
            + "on each other, but I know that seven of us survived the "
            + "slide... and only five made it out. Now we took an oath, "
            + "that I'm breaking now. We said we'd say it was the snow "
            + "that killed the other two, but it wasn't. Nature is lethal "
            + "but it doesn't hold a candle to man.\n"}),
    new Message({userID: US,
      // tslint:disable-next-line:object-literal-sort-keys
      text: "Look, just because I don't be givin' no man a foot massage "
            + "don't make it right for Marsellus to throw Antwone into a "
            + "glass motherfuckin' house, fuckin' up the way the nigger "
            + "talks. Motherfucker do that shit to me, he better paralyze "
            + "my ass, 'cause I'll kill the motherfucker, know what I'm "
            + "sayin'?\n"}),
    new Message({userID: US,
      // tslint:disable-next-line:object-literal-sort-keys
      text: "Your bones don't break, mine do. That's clear. Your cells "
            + "react to bacteria and viruses differently than mine. "
            + "You don't get sick, I do. That's also clear. But for some "
            + "reason, you and I react the exact same way to water. We "
            + "swallow it too fast, we choke. We get some in our lungs, "
            + "we drown. However unreal it may seem, we are connected, "
            + "you and I. We're on the same curve, just on opposite ends."}),
    new Message({userID: THEM,
      // tslint:disable-next-line:object-literal-sort-keys
      text: "You think water moves fast? You should see ice. It moves like "
            + "it has a mind. Like it knows it killed the world once and "
            + "got a taste for murder. After the avalanche, it took us a "
            + "week to climb out. Now, I don't know exactly when we turned "
            + "on each other, but I know that seven of us survived the "
            + "slide... and only five made it out. Now we took an oath, "
            + "that I'm breaking now. We said we'd say it was the snow "
            + "that killed the other two, but it wasn't. Nature is lethal "
            + "but it doesn't hold a candle to man.\n"}),
    new Message({userID: US,
      // tslint:disable-next-line:object-literal-sort-keys
      text: "Look, just because I don't be givin' no man a foot massage "
            + "don't make it right for Marsellus to throw Antwone into a "
            + "glass motherfuckin' house, fuckin' up the way the nigger "
            + "talks. Motherfucker do that shit to me, he better paralyze "
            + "my ass, 'cause I'll kill the motherfucker, know what I'm "
            + "sayin'?\n"}),
  ]})
