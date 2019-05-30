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

import * as React from "react"
import {Grid} from "semantic-ui-react"
import {Dialogue} from "../woz/model/DialogueModel"
import {ChatTranscript} from "../woz/views/ChatTranscript"
import {
  IWozCollectionProperties, WozCollection,
} from "../woz/views/WozCollection"
import css from "./App.module.css"
import {WozConnectors} from "./connector/Connector"

export interface IWoZWithCharCollectionProperties
    extends IWozCollectionProperties {
  dialogue?: Dialogue
}

interface IWoZWithCharCollectionState {
  dialogue: Dialogue
}

interface IChatComponentProperties {
  dialogue?: Dialogue
}

class ChatComponent extends React.Component<IChatComponentProperties,
    IWoZWithCharCollectionState> {

  constructor(props: IChatComponentProperties) {
    super(props)
    this.state = {
      dialogue: props.dialogue || new Dialogue({messages: []})}

    WozConnectors.shared.selectedConnector.onMessage = (message) => {
      this.setState((prev) => {
        return { dialogue: prev.dialogue.appending(message, 300) }
      })
    }
  }

  public render() {
    return <ChatTranscript
        dialogue={this.state.dialogue}
        us={WozConnectors.shared.selectedConnector.chatUserID}
        them={[]}/>
  }
}

// tslint:disable-next-line:max-classes-per-file
export class WoZWithCharCollection
    extends React.Component<IWoZWithCharCollectionProperties, {}> {

  public render() {
    const { dialogue, ...wozProps } = this.props

    return <Grid id={css.appGroupId}>
      <Grid.Column width={4}>
        <ChatComponent dialogue={dialogue}/>
      </Grid.Column>
      <Grid.Column width={12}>
        <WozCollection {...wozProps}/>
      </Grid.Column>
    </Grid>
  }
}
