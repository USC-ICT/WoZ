/*
 * Copyright 2018. University of Southern California
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

// VHMSG JavaScript library
//
// written by Anton Leuski
//
// built upon the websocket example from ActiveMQ distribution
// uses stomp js client from https://github.com/jmesnil/stomp-websocket

import * as StompJS from "@stomp/stompjs"
import {log} from "../../../common/Logger"

export interface IVHMSGParameters {
  readonly address?: string
  readonly scope?: string
  readonly secure?: boolean
}

export interface IVHMSGModel extends IVHMSGParameters {
  readonly address: string
  readonly scope: string
  readonly secure: boolean
}

interface ISubscription {
  readonly headers: StompJS.StompHeaders

  callback(message: StompJS.Message): void
}

enum VHMSGState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTING = "DISCONNECTING",
}

export class VHMSG {

  public get isConnected(): boolean {
    return this.client !== undefined
  }

  private get url(): string {
    if (this.model.secure) {
      return "wss://" + this.model.address + ":61615/stomp"
    } else {
      return "ws://" + this.model.address + ":61614/stomp"
    }
  }

  private get destination(): string {
    return "/topic/" + this.model.scope
  }

  public static readonly DEFAULT_SCOPE: string = "DEFAULT_SCOPE"

  public debug?: (n: string) => void
  public onError?: (reason: Error) => void

  private _model: IVHMSGModel
  private _state: VHMSGState
  private client?: StompJS.Client
  private readonly subscriptions: ISubscription[]
  private subscriptionCounter: number

  private get state(): VHMSGState {
    return this._state
  }

  private set state(newValue: VHMSGState) {
    this._state = newValue
  }

  constructor(props: IVHMSGParameters) {
    this._model = {
      address: props.address || "localhost",
      scope: props.scope || VHMSG.DEFAULT_SCOPE,
      secure: props.secure || false,
    }
    this._state = VHMSGState.DISCONNECTED

    this.client = undefined
    this.subscriptions = []
    this.subscriptionCounter = 0

    // this.debug = (err) => log.debug(err);
    this.onError = (err) => log.error(err)
  }

  public get model(): IVHMSGModel {
    return this._model
  }

  // noinspection JSUnusedGlobalSymbols
  public connect = async (props: IVHMSGParameters): Promise<void> => {

    if (this.state !== VHMSGState.DISCONNECTED) {
      return
    }

    this._model = {
      address: props.address !== undefined ? props.address : this.model.address,
      scope: props.scope !== undefined ? props.scope : this.model.scope,
      secure: props.secure !== undefined ? props.secure : this.model.secure,
    }

    try {
      await this.doConnect()
    } catch (err) {
      this.state = VHMSGState.DISCONNECTED
      throw err
    }
  }

  // noinspection JSUnusedGlobalSymbols
  public disconnect = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      if (this.client === undefined) {
        this.state = VHMSGState.DISCONNECTED
        resolve()
        return
      }

      if (this.state !== VHMSGState.CONNECTED) {
        resolve()
        return
      }

      this.state = VHMSGState.DISCONNECTING
      const client = this.client
      this.client = undefined

      client.onDisconnect = () => {
        this.state = VHMSGState.DISCONNECTED
        resolve()
      }

      client.onStompError = (frame: StompJS.Frame) => {
        reject(this._frameToError(frame))
      }

      client.deactivate()
    })
  }

  // send(full message text)
// or send(header, message)
  public send = (...args: string[]) => {
    if (!this.isConnected || this.client === undefined) {
      return
    }
    const text = Array.prototype.slice.call(args).join(" ").trim()
    if (text.length === 0) {
      return
    }
    const arr = text.split(" ")
    if (arr.length === 0) {
      return
    }

    const first = arr.shift()
    const body = encodeURIComponent(arr.join(" "))
        .replace(/%20/g, "+")

    this.client.publish({
      body: first + " " + body,
      destination: this.destination,
      headers: {
        ELVISH_SCOPE: this.model.scope,
        MESSAGE_PREFIX: first,
      },
      skipContentLengthHeader: true, // this is required.
      // vhmsg lib only handles text messages. ActiveMQ treats
      // incoming messages as binary if it sees content-length header,
      // and as text if it does not. So we must stomp library not to
      // include content-length.
    })
  }

  // noinspection JSUnusedGlobalSymbols
  public subscribe = (
      vhHeader: string,
      callback: (m: string, h: string) => void) => {

    const subscriptionRecord: ISubscription = {
      callback(message: StompJS.Message) {
        const arr = message.body.split(" ")
        const header = arr.length > 0 ? arr[0] : ""
        const body = arr.length > 1 ? arr[1] : ""
        callback(decodeURIComponent(body
            .replace(/\+/g, "%20")), header)
      },
      headers: {
        id: "vh-" + this.subscriptionCounter++,
        selector: ((vhHeader && vhHeader !== "*")
            ? ("MESSAGE_PREFIX='" + vhHeader + "' AND ")
            : "")
            + "ELVISH_SCOPE='" + this.model.scope + "'",
      },
    }

    this.subscriptions.push(subscriptionRecord)

    if (this.client) {
      this.client.subscribe(
          this.destination,
          subscriptionRecord.callback,
          subscriptionRecord.headers)
    }
  }

  private _stompConnect = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const client = new StompJS.Client({
        brokerURL: this.url,
        connectHeaders: {
          login: "guest",
          passcode: "guest",
        },
        debug: (str) => {
          this._debug(str)
        },
        // as of ActiveMQ 5.8.0 there is a bug in ActiveMQ that disables
        // heartbeats for websockets. it causes the client to disconnect after
        // about 5 minutes. We will work around the bug until it's fixed AND
        // iVH updates to the new library. + HEARTBEAT set the client timeout
        // parameters as suggested at
        // https://github.com/jmesnil/stomp-websocket/issues/43
        heartbeatIncoming: 0,
        heartbeatOutgoing: 0,
        reconnectDelay: 0,
      })

      // noinspection JSUnusedLocalSymbols
      client.onConnect = (_frame: StompJS.Frame) => {
        // Do something, all subscribes must be done is this callback
        // This is needed because this will be executed after a (re)connect
        this.client = client
        for (const record of this.subscriptions) {
          this.client.subscribe(
              this.destination, record.callback, record.headers)
        }
        this.state = VHMSGState.CONNECTED
        client.onStompError = this._onStompError
        client.onWebSocketClose = () => {
          if (this.state === VHMSGState.CONNECTED) {
            this.doConnect().catch(((reason) => this._onError(reason)))
          } else {
            this.state = VHMSGState.DISCONNECTED
            // ignore this.
            // this._onError(this._eventToError(event));
          }
        }
        resolve()
      }

      client.onStompError = (frame: StompJS.Frame) => {
        // Will be invoked in case of error encountered at Broker
        // Bad login/passcode typically will cause an error
        // Complaint brokers will set `message` header with a brief message.
        // Body may contain details.
        // Compliant brokers will terminate the connection after any error
        this.state = VHMSGState.DISCONNECTED
        reject(this._frameToError(frame))
      }

      client.onWebSocketClose = (event: CloseEvent) => {
        this.state = VHMSGState.DISCONNECTED
        reject(this._eventToError(event))
      }

      this.state = VHMSGState.CONNECTING
      try {
        client.activate()
      } catch (error) {
        this.state = VHMSGState.DISCONNECTED
        reject(error)
      }
    })
  }

  private _frameToError = (frame: StompJS.Frame): Error => {
    return new Error(
        "Broker reported error: " + frame.headers.message + ". "
        + "Additional details: " + frame.body)
  }

  private _eventToError = (event: CloseEvent): Error => {
    return new Error(event.reason.trim() === ""
        ? "Websocket closed for unknown reasons" : event.reason)
  }

  // noinspection JSUnusedLocalSymbols
  private _onStompError = (_frame: StompJS.Frame) => {
    if (this.state === VHMSGState.CONNECTED) {
      this.doConnect().catch(((reason) => this._onError(reason)))
    }
  }

  private doConnect = async () => {
    let lastError: any
    for (let i = 3; i > 0; --i) {
      try {
        await this._stompConnect()
        return
      } catch (err) {
        lastError = err
      }
    }
    throw lastError
  }

  private _onError = (error: Error) => {
    if (this.onError !== undefined) {
      this.onError(error)
    }
  }

  private _debug = (m: string) => {
    if (this.debug !== undefined) {
      this.debug(m)
    }
  }
}
