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
import {Message} from "semantic-ui-react"
import {arrayMap} from "../../common/util"
import {
  buttonIdentifierInContext, MISSING,
  rowIdentifierInContext, UNDEFINED,
} from "../model/ButtonIdentifier"
import {MODEL} from "../model/ButtonModel"
// import {log} from "../controller/Logger";
import {IWozContext} from "../model/WozModel"
import {Row} from "./Row"
import css from "./screen.module.css"
import {ButtonClickCallback} from "./WozCollection"

interface IScreenProperties {
  context: IWozContext
  identifier?: string
  onButtonClick: ButtonClickCallback
}

export class Screen
    extends React.Component<IScreenProperties, Record<string, never>> {

  public render(): React.ReactNode {
    if (this.props.identifier === undefined) {
      return null
    }
    const screenModel = this.props.context.screens[this.props.identifier]
    const screenTitle = screenModel.label || this.props.identifier
    // log.debug(selectedWoz);
    // log.debug(this.props.identifier);
    // log.debug(screenModel);

    const rows = arrayMap(screenModel.rows, (rowID, rowIndex) => {
      const identifier = rowIdentifierInContext(this.props.context, rowID)
      switch (identifier.kind) {
        case MISSING:
          return (
              <Message key={identifier.id} negative className={css.missingRowMessage}>
                Missing row with ID "{identifier.id}".
              </Message>
          )
        case MODEL:
          return (
              <Row
                  key={rowID}
                  context={this.props.context}
                  buttons={arrayMap(identifier.buttons, (id) => buttonIdentifierInContext(this.props.context, id))}
                  label={identifier.label}
                  index={rowIndex}
                  onButtonClick={this.props.onButtonClick}/>
          )
        case UNDEFINED:
          return null
      }
    })
    return (
        <div className={css.screen}>
          <div className={css.title}>
            {screenTitle}
          </div>
          <div>
            {rows}
          </div>
        </div>
    )
  }
}
