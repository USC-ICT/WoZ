import {Struct} from "google-protobuf/google/protobuf/struct_pb"
import {Timestamp} from "google-protobuf/google/protobuf/timestamp_pb"
import * as grpcWeb from "grpc-web"
import {Omit} from "../../../common/util"
import {IMessage} from "../../../woz/model/MessageModel"
import {
  ClientId, InputInteraction, InteractionRequest,
  InteractionResponse,
  InteractionType,
} from "./generated/client_pb"
import {AgentDialogueClient} from "./generated/ServiceServiceClientPb"

export interface IInputInteractionArguments {
  languageCode?: string
  text?: string
  type?: InteractionType
}

export interface IRequestArguments extends IInputInteractionArguments {
  chosenAgentList?: string[]
  clientID?: ClientId
  conversationID?: string
  time?: Date
  userID: string
}

export type ISendOptions = Omit<IRequestArguments, "text" | "time" | "userID">

export interface ISubscribeArguments extends IRequestArguments {
  onResponse: (response: InteractionResponse) => void
  onError?: (error: grpcWeb.Error) => void
  onStatus?: (error: grpcWeb.Status) => void
  onEnd?: () => void
}

export interface ISubscription {
  invalidate: () => void
}

interface IConcreteSubscription {
  readonly call: grpcWeb.ClientReadableStream<InteractionResponse>
  readonly client: ADConnection
  readonly request: ISubscribeArguments
}

class ConcreteSubscription implements IConcreteSubscription, ISubscription {
  public readonly client!: ADConnection
  public readonly call!: grpcWeb.ClientReadableStream<InteractionResponse>
  public readonly request!: ISubscribeArguments

  constructor(args: IConcreteSubscription) {
    // disabling inspection due to a bug in Intellij type checking
    // https://youtrack.jetbrains.com/issue/WEB-36766
    // noinspection TypeScriptValidateTypes
    Object.assign(this, args)
  }

  // noinspection JSUnusedGlobalSymbols
  public invalidate = () => {
    this.call.cancel()
    this.client.remove(this)
  }
}

interface IADTextResponse {
  responseID: string
  text: string
  userID: string
  time: Date
}

declare module "./generated/client_pb" {
  interface InteractionResponse {
    asTextResponse(): IADTextResponse
  }
}

// noinspection JSUnusedGlobalSymbols
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
proto.edu.gla.kail.ad.InteractionResponse.prototype.asTextResponse =
    function(): IADTextResponse {
  return {
    responseID: this.getResponseId(),
    text: this.getInteractionList()[0].getText(),
    time: new Date(this.getTime().getSeconds() * 1000
                   + this.getTime().getNanos() / 1e+6),
    userID: this.getUserId(),
  }
}

export class ADConnection {

  private _hostURL: string
  private _client?: AgentDialogueClient
  private _subscriptions: ConcreteSubscription[]

  // We must extend eslint-disable on the following code because
  // for some reason ESLint goes berserk and believes that all types
  // imported from grpc-web generated code are 'any'. For example,
  // it swears that InputInteraction is an alias to any. So, it
  // complains on each line because it sees us calling functions on
  // an object of type any. I cannot find a way to convince it
  // that it's wrong. Meanwhile, Intellij parsing is perfectly
  // fine.
  private _makeInputInteraction = (args: IInputInteractionArguments)
      : InputInteraction => {
    const input: InputInteraction = new InputInteraction()
    input.setText(args.text || "")
    input.setLanguageCode(args.languageCode || "en-US")
    input.setType(args.type || InteractionType.TEXT)
    // eslint-disable-next-line
    return input
  }

  // noinspection SpellCheckingInspection
  private _makeInteractionRequest = (args: IRequestArguments)
      : InteractionRequest => {
    const input: InputInteraction = this._makeInputInteraction(args)

    // tslint:disable-next-line:new-parens
    const request = new InteractionRequest()
    request.setClientId(args.clientID || ClientId.WEB_SIMULATOR)
    request.setInteraction(input)
    request.setUserId(args.userID)

    const time = args.time || new Date()
    const timestamp = new Timestamp()
    timestamp.setSeconds(Math.floor(time.getTime() / 1000))
    timestamp.setNanos((Math.floor(time.getTime()) % 1000) * 1e+6)
    request.setTime(timestamp)
    request.setChosenAgentsList(args.chosenAgentList || ["WizardOfOz"])
    if (args.conversationID !== undefined) {
      request.setAgentRequestParameters(Struct.fromJavaScript({
        conversationId: args.conversationID,
      }) as any)
    }

    return request
  }

  // noinspection JSUnusedGlobalSymbols
  private _subscribe = (args: ISubscribeArguments): ConcreteSubscription => {
    const request = this._makeInteractionRequest(args)

    const call = this.getClient().listResponses(
        request, {})

    call.on("data", args.onResponse)

    call.on("error", args.onError || ((error: grpcWeb.Error) => {
      console.error(error)
    }))

    call.on("status", args.onStatus || ((status: grpcWeb.Status) => {
      // tslint:disable-next-line:no-console
      // eslint-disable-next-line no-console
      console.debug(status)
    }))

    call.on("end", args.onEnd || (() => {
      // tslint:disable-next-line:no-console
      // eslint-disable-next-line no-console
      console.debug("stream closed connection")
    }))

    return new ConcreteSubscription({request: args, call, client: this})
  }
  /* eslint-enable @typescript-eslint/no-unsafe-return */
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  /* eslint-enable @typescript-eslint/no-unsafe-call */
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */

  private getClient = (): AgentDialogueClient => {
    if (this._client !== undefined) { return this._client }
    // noinspection SpellCheckingInspection
    return this._client = new AgentDialogueClient(
        this._hostURL, null)
  }

  // noinspection JSUnusedGlobalSymbols
  public get hostURL(): string {
    return this._hostURL
  }

  // noinspection JSUnusedGlobalSymbols
  public set hostURL(url: string) {
    if (url === this._hostURL) { return }
    this._subscriptions.forEach((sub) => {sub.call.cancel()})
    this._hostURL = url.replace(/\/+$/, "")
    this._client = undefined
    this._subscriptions = this._subscriptions.map(
        (sub) => this._subscribe(sub.request))
  }

  constructor(host: string) {
    this._hostURL = host.replace(/\/+$/, "")
    this._subscriptions = []
  }

  public remove = (sub: ConcreteSubscription): void => {
    const index = this._subscriptions.indexOf(sub)
    if (index < 0) { return }
    this._subscriptions.splice(index, 1)
  }

  // noinspection JSUnusedGlobalSymbols
  public send = (message: IMessage, options?: ISendOptions): void => {
    const userID = message.userID
    if (userID === undefined) { return }

    const request = this._makeInteractionRequest(
        { ...(options || {}), ...message, userID})
    // console.log("request: ", request)

    // noinspection JSUnusedLocalSymbols
    this.getClient().getResponseFromAgents(
        request, {},
        (_err: grpcWeb.Error,
         _response: InteractionResponse) => {
          // console.log("echo", _response)
          message.id = _response.asTextResponse().responseID
        })
  }

  // noinspection JSUnusedGlobalSymbols
  public subscribe = (args: ISubscribeArguments): ISubscription => {
    const sub = this._subscribe(args)
    this._subscriptions.push(sub)
    return sub
  }

  // noinspection JSUnusedGlobalSymbols
  public terminate = (): void => {
    this._subscriptions.forEach((sub) => {sub.call.cancel()})
    this._subscriptions = []
  }
}
