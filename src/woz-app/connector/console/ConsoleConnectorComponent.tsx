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

import * as React from "react"
import {Segment} from "semantic-ui-react"
import css from "../../App.module.css"

export class ConsoleConnectorComponent
    extends React.Component<Record<string, never>, Record<string, never>> {

  public render(): React.ReactNode {
    return (
        <Segment className={css.connectorEditorSubSegment} tertiary>
        <div>
          This connector renders the event content onto the browser console.
        </div>
        </Segment>
    )
  }
}
