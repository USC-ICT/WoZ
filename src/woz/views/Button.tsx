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
import {Popup} from "semantic-ui-react"
import {objectMap, styles} from "../../common/util"
import {IButtonModel} from "../model/ButtonModel"
import {IWozContext} from "../model/WozModel"
import css from "./button.module.css"
import {Label} from "./Label"

interface IButtonProperties {
  identifier: string
  context: IWozContext
  onButtonClick: (buttonModel: IButtonModel) => void
}

const BADGE_STYLES = {
  bottom: css.bottom,
  center: css.center,
  left: css.left,
  middle: css.middle,
  right: css.right,
  top: css.top,
}

export class Button extends React.Component<IButtonProperties, {}> {

  public static placeholderID: string

  public render() {

    const buttonModel = this.props.context.buttons[this.props.identifier]
    if (buttonModel === undefined) {
      return (
          <div className={styles(css.button, css.missing)}>
            <Label model={{}}>Missing button with
              ID "{this.props.identifier}".</Label>
          </div>
      )
    }

    const badgeStyles = (style: string): string[] => {
      const lowercased = style.toLocaleLowerCase()
      return Object.entries(BADGE_STYLES)
                   .reduce((previousValue, currentValue) => {
                     return new RegExp(currentValue[0], "g").test(lowercased)
                            ? previousValue.concat([currentValue[1]])
                            : previousValue
                   }, [css.badge])
    }

    const badges = objectMap(buttonModel.badges,
        ([badgeID, badgeText]) =>
            <span key={badgeID}
                  className={styles.apply(null,
                      badgeStyles(badgeID))}>{badgeText}</span>)

    const buttonStyle = buttonModel.color !== undefined
                        && this.props.context.colors[buttonModel.color]
                        !== undefined ? {
      background: this.props.context.colors[buttonModel.color].css,
    } : {}

    const button = (
        <div className={styles(css.button, css.selectable)}
             onClick={() => {
               this.props.onButtonClick(buttonModel)
             }}
             style={buttonStyle}>
          {badges}
          <Label model={buttonModel}>{buttonModel.label}</Label>
        </div>
    )

    return (
        <Popup inverted={true} trigger={button} content={buttonModel.tooltip}/>
    )
  }
}

Button.placeholderID = "__placeholder__"
