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

type CoalescerHandler = () => void

export class Coalescer {
  private delay: number

  private timer?: number

  private handler?: CoalescerHandler

  private _timerCallback = () => {
    if (this.timer === undefined) {
      return
    }
    this.timer = undefined
    if (this.handler === undefined) {
      return
    }
    this.handler()
  }

  constructor() {
    this.delay = 1000
  }

  // noinspection JSUnusedGlobalSymbols
  public append = (handler: CoalescerHandler, delay?: number) => {
    this.stop()
    this.handler = handler
    if (delay !== undefined) {
      this.delay = delay
    }
    this.timer = window.setTimeout(this._timerCallback, this.delay)
  }

  public stop = () => {
    if (this.timer === undefined) {
      return
    }
    window.clearTimeout(this.timer)
    this.timer = undefined
  }
}
