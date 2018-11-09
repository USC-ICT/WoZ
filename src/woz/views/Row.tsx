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
import {arrayMap, styles} from "../../common/util"
import {IWozContext} from "../model/WozModel"
import {Button} from "./Button"
import buttonStyles from "./button.module.css"
import rowStyles from "./row.module.css"
import {ButtonClickCallback} from "./WozCollection"

interface IRowProperties {
  buttons?: string[]
  context: IWozContext
  index: number
  label: string
  onButtonClick: ButtonClickCallback
}

export class Row extends React.Component<IRowProperties, {}> {

  public render() {
    if (this.props.buttons === undefined) {
      return null
    }

    const seenKeys = new Set<string>()

    const buttons = arrayMap(this.props.buttons, (buttonID, index) => {
      // the key must be unique among siblings, but we may have the same
      // button added multiple times
      let key = buttonID
      while (seenKeys.has(key)) {
        key = key + "_"
      }
      seenKeys.add(key)

      if (buttonID === Button.placeholderID) {
        return (
            <div key={index} className={styles(buttonStyles.button, buttonStyles.placeholder)}/>
        )
      }

      return (
          <Button
              key={key}
              context={this.props.context}
              identifier={buttonID}
              onButtonClick={this.props.onButtonClick}/>
      )
    })

    return (
        <div className={styles(rowStyles.row, (((this.props.index % 2) === 1)
                                               ? rowStyles.odd : rowStyles.even))}>
          <div key="header" className={rowStyles.header}>
            {this.props.label}
          </div>
          <div key="content" className={rowStyles.content}>
            {buttons}
          </div>
        </div>
    )
  }
}
