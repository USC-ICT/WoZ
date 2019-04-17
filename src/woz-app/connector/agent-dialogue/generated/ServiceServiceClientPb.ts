/**
 * @fileoverview gRPC-Web generated client stub for edu.gla.kail.ad.service
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


import * as grpcWeb from 'grpc-web';
import {
  InputInteraction,
  InteractionRequest,
  InteractionResponse,
  OutputInteraction,
  UserID,
  ListValue,
  Struct,
  FieldsEntry,
  Timestamp,
  Value} from './service_pb';

export class AgentDialogueClient {
  client_: grpcWeb.AbstractClientBase;
  hostname_: string;
  credentials_: null | { [index: string]: string; };
  options_: null | { [index: string]: string; };

  constructor (hostname: string,
               credentials: null | { [index: string]: string; },
               options: null | { [index: string]: string; }) {
    if (!options) options = {};
    options['format'] = 'text';

    this.client_ = new grpcWeb.GrpcWebClientBase(options);
    this.hostname_ = hostname;
    this.credentials_ = credentials;
    this.options_ = options;
  }

  methodInfoGetResponseFromAgents = new grpcWeb.AbstractClientBase.MethodInfo(
    InteractionResponse,
    (request: InteractionRequest) => {
      return request.serializeBinary();
    },
    InteractionResponse.deserializeBinary
  );

  getResponseFromAgents(
    request: InteractionRequest,
    metadata: grpcWeb.Metadata,
    callback: (err: grpcWeb.Error,
               response: InteractionResponse) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/edu.gla.kail.ad.service.AgentDialogue/GetResponseFromAgents',
      request,
      metadata,
      this.methodInfoGetResponseFromAgents,
      callback);
  }

  methodInfoEndSession = new grpcWeb.AbstractClientBase.MethodInfo(
    UserID,
    (request: UserID) => {
      return request.serializeBinary();
    },
    UserID.deserializeBinary
  );

  endSession(
    request: UserID,
    metadata: grpcWeb.Metadata,
    callback: (err: grpcWeb.Error,
               response: UserID) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/edu.gla.kail.ad.service.AgentDialogue/EndSession',
      request,
      metadata,
      this.methodInfoEndSession,
      callback);
  }

  methodInfoListResponses = new grpcWeb.AbstractClientBase.MethodInfo(
    InteractionResponse,
    (request: InteractionRequest) => {
      return request.serializeBinary();
    },
    InteractionResponse.deserializeBinary
  );

  listResponses(
    request: InteractionRequest,
    metadata: grpcWeb.Metadata) {
    return this.client_.serverStreaming(
      this.hostname_ +
        '/edu.gla.kail.ad.service.AgentDialogue/ListResponses',
      request,
      metadata,
      this.methodInfoListResponses);
  }

}

