export class InputInteraction {
  constructor ();
  getText(): string;
  setText(a: string): void;
  getAudioBytes(): string;
  setAudioBytes(a: string): void;
  getActionList(): string[];
  setActionList(a: string[]): void;
  getType(): InteractionType;
  setType(a: InteractionType): void;
  getDeviceType(): string;
  setDeviceType(a: string): void;
  getLanguageCode(): string;
  setLanguageCode(a: string): void;
  toObject(): InputInteraction.AsObject;
  serializeBinary(): Uint8Array;
  static deserializeBinary: (bytes: {}) => InputInteraction;
}

export namespace InputInteraction {
  export type AsObject = {
    Text: string;
    AudioBytes: string;
    ActionList: string[];
    Type: InteractionType;
    DeviceType: string;
    LanguageCode: string;
  }
}

export class InteractionRequest {
  constructor ();
  getTime(): Timestamp;
  setTime(a: Timestamp): void;
  getClientId(): ClientId;
  setClientId(a: ClientId): void;
  getInteraction(): InputInteraction;
  setInteraction(a: InputInteraction): void;
  getUserId(): string;
  setUserId(a: string): void;
  getAgentRequestParameters(): Struct;
  setAgentRequestParameters(a: Struct): void;
  getChosenAgentsList(): string[];
  setChosenAgentsList(a: string[]): void;
  toObject(): InteractionRequest.AsObject;
  serializeBinary(): Uint8Array;
  static deserializeBinary: (bytes: {}) => InteractionRequest;
}

export namespace InteractionRequest {
  export type AsObject = {
    Time: Timestamp;
    ClientId: ClientId;
    Interaction: InputInteraction;
    UserId: string;
    AgentRequestParameters: Struct;
    ChosenAgentsList: string[];
  }
}

export class InteractionResponse {
  constructor ();
  getResponseId(): string;
  setResponseId(a: string): void;
  getTime(): Timestamp;
  setTime(a: Timestamp): void;
  getClientId(): ClientId;
  setClientId(a: ClientId): void;
  getInteractionList(): OutputInteraction[];
  setInteractionList(a: OutputInteraction[]): void;
  getMessageStatus(): InteractionResponse.ClientMessageStatus;
  setMessageStatus(a: InteractionResponse.ClientMessageStatus): void;
  getErrorMessage(): string;
  setErrorMessage(a: string): void;
  getUserId(): string;
  setUserId(a: string): void;
  getSessionId(): string;
  setSessionId(a: string): void;
  toObject(): InteractionResponse.AsObject;
  serializeBinary(): Uint8Array;
  static deserializeBinary: (bytes: {}) => InteractionResponse;
}

export namespace InteractionResponse {
  export type AsObject = {
    ResponseId: string;
    Time: Timestamp;
    ClientId: ClientId;
    InteractionList: OutputInteraction[];
    MessageStatus: InteractionResponse.ClientMessageStatus;
    ErrorMessage: string;
    UserId: string;
    SessionId: string;
  }

  export enum ClientMessageStatus { 
    NONSET = 0,
    SUCCESSFUL = 1,
    ERROR = 2,
  }
}

export class OutputInteraction {
  constructor ();
  getText(): string;
  setText(a: string): void;
  getAudioBytes(): string;
  setAudioBytes(a: string): void;
  getActionList(): string[];
  setActionList(a: string[]): void;
  getType(): InteractionType;
  setType(a: InteractionType): void;
  toObject(): OutputInteraction.AsObject;
  serializeBinary(): Uint8Array;
  static deserializeBinary: (bytes: {}) => OutputInteraction;
}

export namespace OutputInteraction {
  export type AsObject = {
    Text: string;
    AudioBytes: string;
    ActionList: string[];
    Type: InteractionType;
  }
}

export class UserID {
  constructor ();
  getUserId(): string;
  setUserId(a: string): void;
  getActivesession(): boolean;
  setActivesession(a: boolean): void;
  toObject(): UserID.AsObject;
  serializeBinary(): Uint8Array;
  static deserializeBinary: (bytes: {}) => UserID;
}

export namespace UserID {
  export type AsObject = {
    UserId: string;
    Activesession: boolean;
  }
}

export class ListValue {
  constructor ();
  getValuesList(): Value[];
  setValuesList(a: Value[]): void;
  toObject(): ListValue.AsObject;
  serializeBinary(): Uint8Array;
  static deserializeBinary: (bytes: {}) => ListValue;
}

export namespace ListValue {
  export type AsObject = {
    ValuesList: Value[];
  }
}

export class Struct {
  constructor ();
  getFieldsList(): Struct.FieldsEntry[];
  setFieldsList(a: Struct.FieldsEntry[]): void;
  toObject(): Struct.AsObject;
  serializeBinary(): Uint8Array;
  static deserializeBinary: (bytes: {}) => Struct;
}

export namespace Struct {
  export type AsObject = {
    FieldsList: Struct.FieldsEntry[];
  }
  export type FieldsEntry = StructFieldsEntry;
}

export class StructFieldsEntry {
  constructor ();
  getKey(): string;
  setKey(a: string): void;
  getValue(): Value;
  setValue(a: Value): void;
  toObject(): StructFieldsEntry.AsObject;
  serializeBinary(): Uint8Array;
  static deserializeBinary: (bytes: {}) => StructFieldsEntry;
}

export namespace StructFieldsEntry {
  export type AsObject = {
    Key: string;
    Value: Value;
  }
}

export class FieldsEntry {
  constructor ();
  getKey(): string;
  setKey(a: string): void;
  getValue(): Value;
  setValue(a: Value): void;
  toObject(): FieldsEntry.AsObject;
  serializeBinary(): Uint8Array;
  static deserializeBinary: (bytes: {}) => FieldsEntry;
}

export namespace FieldsEntry {
  export type AsObject = {
    Key: string;
    Value: Value;
  }
}

export class Timestamp {
  constructor ();
  getSeconds(): number;
  setSeconds(a: number): void;
  getNanos(): number;
  setNanos(a: number): void;
  toObject(): Timestamp.AsObject;
  serializeBinary(): Uint8Array;
  static deserializeBinary: (bytes: {}) => Timestamp;
}

export namespace Timestamp {
  export type AsObject = {
    Seconds: number;
    Nanos: number;
  }
}

export class Value {
  constructor ();
  getNullValue(): NullValue;
  setNullValue(a: NullValue): void;
  getNumberValue(): number;
  setNumberValue(a: number): void;
  getStringValue(): string;
  setStringValue(a: string): void;
  getBoolValue(): boolean;
  setBoolValue(a: boolean): void;
  getStructValue(): Struct;
  setStructValue(a: Struct): void;
  getListValue(): ListValue;
  setListValue(a: ListValue): void;
  toObject(): Value.AsObject;
  serializeBinary(): Uint8Array;
  static deserializeBinary: (bytes: {}) => Value;
}

export namespace Value {
  export type AsObject = {
    NullValue: NullValue;
    NumberValue: number;
    StringValue: string;
    BoolValue: boolean;
    StructValue: Struct;
    ListValue: ListValue;
  }
}

