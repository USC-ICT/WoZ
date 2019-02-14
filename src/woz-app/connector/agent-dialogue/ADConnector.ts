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

import {Struct} from "google-protobuf/google/protobuf/struct_pb"
import * as grpcWeb from "grpc-web"
import * as React from "react"
import {log} from "../../../common/Logger"
import {IButtonModel} from "../../../woz/model/ButtonModel"
import {Store} from "../../Store"
import {IWozConnector} from "../Connector"
import {ADConnectorComponent} from "./ADConnectorComponent"
import {AgentDialogueClient} from "./generated/service_grpc_web_pb"

// If the compiler gives you errors like
//  'proto' is not defined
//
//   add the following at the otp of every .js file.
//  /* eslint-disable */


export interface IADConnectorModel {
  conversationId?: string
  serverURL: string
  userId?: string
}

export class ADConnector implements IWozConnector {
  constructor() {
    this.id = "ADConnector"
    this.title = "Agent Dialogue"
    this.model = Store.shared.firebase
  }

  private service?: AgentDialogueClient
  private stream?: any

  public readonly id: string

  public readonly title: string

  public model: IADConnectorModel

  public component = (): any => {
    return React.createElement(
        ADConnectorComponent, {connector: this}, null)
  }

  public onUIAppear = (): void => {
     this.stream = this.subscribe()
  }

  public subscribe = (): any => {
    if (this.model.userId === undefined
        || this.model.conversationId === undefined) {
      return
    }

    if (this.service === undefined || this.service.hostname_ !== this.model.serverURL) {
      this.service = new AgentDialogueClient(
          this.model.serverURL, null, {suppressCorsPreflight : false})
    }

    const input = new proto.edu.gla.kail.ad.InputInteraction()
    input.setText("")
    input.setLanguageCode("en-US")
    input.setType(proto.edu.gla.kail.ad.InteractionType.TEXT)

    const request = new proto.edu.gla.kail.ad.InteractionRequest()
    request.setClientId(proto.edu.gla.kail.ad.ClientId.WEB_SIMULATOR)
    request.setInteraction(input)
    request.setUserId(this.model.userId)
    request.setChosenAgentsList(["myquotemaster-13899"])
    // request.setChosenAgentsList(["WizardOfOz"])
    request.setAgentRequestParameters(Struct.fromJavaScript({
      conversationId: this.model.conversationId,
    }))

    log.debug(request.toObject())

    const call = this.service.listResponses(
        request, {})

    call.on("data", (response: proto.edu.gla.kail.ad.InteractionResponse) => {
      log.debug(response.toObject())
    })

    call.on("error", (error: grpcWeb.Error) => {
      log.error(error)
    })

    call.on("status", (status: grpcWeb.Status) => {
      log.debug(status)
    })

    call.on("end", () => {
      log.debug("stream closed connection")
    })

    return call
  }

  // noinspection JSUnusedGlobalSymbols
  public onButtonClick = (buttonModel: IButtonModel) => {

    if (this.model.userId === undefined
        || this.model.conversationId === undefined) {
      return
    }

    if (this.service === undefined || this.service.hostname_ !== this.model.serverURL) {
      this.service = new AgentDialogueClient(
          this.model.serverURL, null, {suppressCorsPreflight : false})
    }

    // const conversationIdValue = new Value()
    // conversationIdValue.setStringValue(this.model.conversationId)
    //
    // const fieldEntry = new StructFieldsEntry()
    // fieldEntry.setKey("conversationId")
    // fieldEntry.setValue(conversationIdValue)
    //
    // const agentRequestParam = new Struct()
    // agentRequestParam.setFieldsList([fieldEntry])

    const input = new proto.edu.gla.kail.ad.InputInteraction()
    input.setText(buttonModel.tooltip)
    input.setLanguageCode("en-US")
    input.setType(proto.edu.gla.kail.ad.InteractionType.TEXT)

    const request = new proto.edu.gla.kail.ad.InteractionRequest()
    request.setClientId(proto.edu.gla.kail.ad.ClientId.WEB_SIMULATOR)
    request.setInteraction(input)
    request.setUserId(this.model.userId)
    request.setChosenAgentsList(["myquotemaster-13899"])
    // request.setChosenAgentsList(["WizardOfOz"])
    request.setAgentRequestParameters(Struct.fromJavaScript({
      conversationId: this.model.conversationId,
    }))

    log.debug(request.toObject())

    // request.setAgentRequestParameters(agentRequestParam)

    // this.service.getResponseFromAgents(
    //     request,
    //     (err: grpcWeb.Error | null, response: InteractionResponse | null) => {
    //   log.debug(err)
    //   log.debug(response)
    // })

    this.service.getResponseFromAgents(
        request, {},
        (err: grpcWeb.Error | null,
         response: proto.edu.gla.kail.ad.InteractionResponse | null) => {
          if (err !== null) {
            log.error(err)
          }
          if (response !== null) {
            log.debug(response.toObject())
          }
        })

    // const agent_request_parameters_value = JSON.stringify({
    //   conversationId: this.model.conversationId,
    // })
    //
    // const content: { [s: string]: string } = {
    //   agent_request_parameters: agent_request_parameters_value,
    //   chosen_agents: "WizardOfOz",
    //   language: "en-US",
    //   textInput: buttonModel.tooltip,
    //   userId: this.model.userId,
    // }
    //
    // const contentAsQuery = Object
    //     .keys(content)
    //     .map((key) => encodeURIComponent(key)
    //                   + "=" + encodeURIComponent(content[key]))
    //     .join("&")
    //
    // request(
    //     {
    //       headers: {
    //         Operation: "sendRequest",
    //       },
    //       method: "GET",
    //       responseType: "json",
    //       url: this.model.serverURL + "?" + contentAsQuery,
    //     })
    //     .then((response) => {
    //       log.debug("success", buttonModel)
    //       log.debug("response", response)
    //     })
    //     .catch((err) => {
    //       log.error(err)
    //     })

    log.debug("clicked:", "'" + buttonModel.id + "'", buttonModel.tooltip)
  }
}
