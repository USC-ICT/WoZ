import * as jspb from "google-protobuf"

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';
import * as google_protobuf_struct_pb from 'google-protobuf/google/protobuf/struct_pb';

export class ClientConversation extends jspb.Message {
  getTurnList(): Array<ClientTurn>;
  setTurnList(value: Array<ClientTurn>): void;
  clearTurnList(): void;
  addTurn(value?: ClientTurn, index?: number): ClientTurn;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClientConversation.AsObject;
  static toObject(includeInstance: boolean, msg: ClientConversation): ClientConversation.AsObject;
  static serializeBinaryToWriter(message: ClientConversation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClientConversation;
  static deserializeBinaryFromReader(message: ClientConversation, reader: jspb.BinaryReader): ClientConversation;
}

export namespace ClientConversation {
  export type AsObject = {
    turnList: Array<ClientTurn.AsObject>,
  }
}

export class ClientTurn extends jspb.Message {
  getInteractionRequest(): InteractionRequest | undefined;
  setInteractionRequest(value?: InteractionRequest): void;
  hasInteractionRequest(): boolean;
  clearInteractionRequest(): void;

  getInteractionResponse(): InteractionResponse | undefined;
  setInteractionResponse(value?: InteractionResponse): void;
  hasInteractionResponse(): boolean;
  clearInteractionResponse(): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClientTurn.AsObject;
  static toObject(includeInstance: boolean, msg: ClientTurn): ClientTurn.AsObject;
  static serializeBinaryToWriter(message: ClientTurn, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClientTurn;
  static deserializeBinaryFromReader(message: ClientTurn, reader: jspb.BinaryReader): ClientTurn;
}

export namespace ClientTurn {
  export type AsObject = {
    interactionRequest?: InteractionRequest.AsObject,
    interactionResponse?: InteractionResponse.AsObject,
  }
}

export class InteractionRequest extends jspb.Message {
  getTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasTime(): boolean;
  clearTime(): void;

  getClientId(): ClientId;
  setClientId(value: ClientId): void;

  getInteraction(): InputInteraction | undefined;
  setInteraction(value?: InputInteraction): void;
  hasInteraction(): boolean;
  clearInteraction(): void;

  getUserId(): string;
  setUserId(value: string): void;

  getAgentRequestParameters(): google_protobuf_struct_pb.Struct | undefined;
  setAgentRequestParameters(value?: google_protobuf_struct_pb.Struct): void;
  hasAgentRequestParameters(): boolean;
  clearAgentRequestParameters(): void;

  getChosenAgentsList(): Array<string>;
  setChosenAgentsList(value: Array<string>): void;
  clearChosenAgentsList(): void;
  addChosenAgents(value: string, index?: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InteractionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: InteractionRequest): InteractionRequest.AsObject;
  static serializeBinaryToWriter(message: InteractionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InteractionRequest;
  static deserializeBinaryFromReader(message: InteractionRequest, reader: jspb.BinaryReader): InteractionRequest;
}

export namespace InteractionRequest {
  export type AsObject = {
    time?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    clientId: ClientId,
    interaction?: InputInteraction.AsObject,
    userId: string,
    agentRequestParameters?: google_protobuf_struct_pb.Struct.AsObject,
    chosenAgentsList: Array<string>,
  }
}

export class InteractionResponse extends jspb.Message {
  getResponseId(): string;
  setResponseId(value: string): void;

  getTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTime(value?: google_protobuf_timestamp_pb.Timestamp): void;
  hasTime(): boolean;
  clearTime(): void;

  getClientId(): ClientId;
  setClientId(value: ClientId): void;

  getInteractionList(): Array<OutputInteraction>;
  setInteractionList(value: Array<OutputInteraction>): void;
  clearInteractionList(): void;
  addInteraction(value?: OutputInteraction, index?: number): OutputInteraction;

  getMessageStatus(): InteractionResponse.ClientMessageStatus;
  setMessageStatus(value: InteractionResponse.ClientMessageStatus): void;

  getErrorMessage(): string;
  setErrorMessage(value: string): void;

  getUserId(): string;
  setUserId(value: string): void;

  getSessionId(): string;
  setSessionId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InteractionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: InteractionResponse): InteractionResponse.AsObject;
  static serializeBinaryToWriter(message: InteractionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InteractionResponse;
  static deserializeBinaryFromReader(message: InteractionResponse, reader: jspb.BinaryReader): InteractionResponse;
}

export namespace InteractionResponse {
  export type AsObject = {
    responseId: string,
    time?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    clientId: ClientId,
    interactionList: Array<OutputInteraction.AsObject>,
    messageStatus: InteractionResponse.ClientMessageStatus,
    errorMessage: string,
    userId: string,
    sessionId: string,
  }

  export enum ClientMessageStatus { 
    NONSET = 0,
    SUCCESSFUL = 1,
    ERROR = 2,
  }
}

export class InputInteraction extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getAudioBytes(): string;
  setAudioBytes(value: string): void;

  getActionList(): Array<string>;
  setActionList(value: Array<string>): void;
  clearActionList(): void;
  addAction(value: string, index?: number): void;

  getType(): InteractionType;
  setType(value: InteractionType): void;

  getDeviceType(): string;
  setDeviceType(value: string): void;

  getLanguageCode(): string;
  setLanguageCode(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InputInteraction.AsObject;
  static toObject(includeInstance: boolean, msg: InputInteraction): InputInteraction.AsObject;
  static serializeBinaryToWriter(message: InputInteraction, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InputInteraction;
  static deserializeBinaryFromReader(message: InputInteraction, reader: jspb.BinaryReader): InputInteraction;
}

export namespace InputInteraction {
  export type AsObject = {
    text: string,
    audioBytes: string,
    actionList: Array<string>,
    type: InteractionType,
    deviceType: string,
    languageCode: string,
  }
}

export class OutputInteraction extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getAudioBytes(): string;
  setAudioBytes(value: string): void;

  getActionList(): Array<string>;
  setActionList(value: Array<string>): void;
  clearActionList(): void;
  addAction(value: string, index?: number): void;

  getType(): InteractionType;
  setType(value: InteractionType): void;

  getResultList(): Array<Result>;
  setResultList(value: Array<Result>): void;
  clearResultList(): void;
  addResult(value?: Result, index?: number): Result;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OutputInteraction.AsObject;
  static toObject(includeInstance: boolean, msg: OutputInteraction): OutputInteraction.AsObject;
  static serializeBinaryToWriter(message: OutputInteraction, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OutputInteraction;
  static deserializeBinaryFromReader(message: OutputInteraction, reader: jspb.BinaryReader): OutputInteraction;
}

export namespace OutputInteraction {
  export type AsObject = {
    text: string,
    audioBytes: string,
    actionList: Array<string>,
    type: InteractionType,
    resultList: Array<Result.AsObject>,
  }
}

export class Result extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getScore(): number;
  setScore(value: number): void;

  getRank(): number;
  setRank(value: number): void;

  getTitle(): string;
  setTitle(value: string): void;

  getShortDescription(): string;
  setShortDescription(value: string): void;

  getFullText(): string;
  setFullText(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Result.AsObject;
  static toObject(includeInstance: boolean, msg: Result): Result.AsObject;
  static serializeBinaryToWriter(message: Result, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Result;
  static deserializeBinaryFromReader(message: Result, reader: jspb.BinaryReader): Result;
}

export namespace Result {
  export type AsObject = {
    id: string,
    score: number,
    rank: number,
    title: string,
    shortDescription: string,
    fullText: string,
  }
}

export enum ClientId { 
  NONSET = 0,
  EXTERNAL_APPLICATION = 1,
  LOG_REPLAYER = 2,
  WEB_SIMULATOR = 3,
}
export enum InteractionType { 
  NOTSET = 0,
  TEXT = 1,
  AUDIO = 2,
  ACTION = 3,
}
