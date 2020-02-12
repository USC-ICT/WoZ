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
import {log} from "../../common/Logger"
import {arrayMap, styles} from "../../common/util"
import {
  ButtonIdentifier,
  MISSING,
  RowIdentifier, UNDEFINED,
} from "../model/ButtonIdentifier"
import {MODEL} from "../model/ButtonModel"
import {IWozContext} from "../model/WozModel"
import {Button} from "./Button"
import buttonStyles from "./button.module.css"
import rowStyles from "./row.module.css"
import {ButtonClickCallback} from "./WozCollection"

interface IRowProperties {
  buttons?: ButtonIdentifier[]
  rows?: RowIdentifier[]
  context: IWozContext
  index: number
  label: string
  onButtonClick: ButtonClickCallback
}

export class Row extends React.Component<IRowProperties, {}> {

  private _buttonTitle = (index: number): string => {
    if (this.props.rows === undefined) { return "rows undefined" }

    if (this.props.rows.length <= index) {
      return "index " + index + " of " + this.props.rows.length
    }

    const titleID = this.props.rows[index]
    if (titleID === undefined) { return "" }

    switch (titleID.kind) {
      case MISSING:
        return "no row " + titleID.id
      case MODEL:
        return titleID.label
      case UNDEFINED:
        return ""
    }
  }

  public render() {
    if (this.props.buttons === undefined) {
      return null
    }

    const seenKeys = new Set<string>()

    const buttons = arrayMap(this.props.buttons, (buttonID, index) => {
      // the key must be unique among siblings, but we may have the same
      // button added multiple times
      let key = buttonID.id
      while (seenKeys.has(key)) {
        key = key + "_"
      }
      seenKeys.add(key)

      const button = <Button
          key={key}
          context={this.props.context}
          identifier={buttonID}
          onButtonClick={this.props.onButtonClick}/>

      if (this.props.rows === undefined) {
        return button
      }

      return <div
          className={styles(buttonStyles.titledButton)}
          key={key}>{button}
        <div className={styles(buttonStyles.titledButton)}>
          {this._buttonTitle(index)}
        </div>
      </div>
    })

    return (
        <div className={styles(rowStyles.row, (((this.props.index % 2) === 1)
                                               ? rowStyles.odd
                                               : rowStyles.even))}>
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
