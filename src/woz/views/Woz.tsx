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
import {arrayMap} from "../../common/util"
import {ButtonModel, IButtonModel} from "../model/ButtonModel"
import {IRowModel} from "../model/RowModel"
import {IWozContext} from "../model/WozModel"
import {Row} from "./Row"
import {Screen} from "./Screen"
import {TemplateEditor} from "./TemplateEditor"
import css from "./woz.module.css"
import {ButtonClickCallback} from "./WozCollection"

interface IWozProperties {
  onButtonClick: ButtonClickCallback
  didChangeScreen: (screenID: string) => void
  persistentRows: IRowModel[]
  woz: IWozContext
  selectedScreenID?: string
}

interface IWozState {
  selectedScreenID: string
  buttonToExpand?: ButtonModel
}

export class Woz extends React.Component<IWozProperties, IWozState> {

  private _handleClick = (buttonModel: IButtonModel) => {
    if (this.state.selectedScreenID === undefined) {
      return
    }

    let targetID = buttonModel.transitions[this.state.selectedScreenID]
    if (targetID === undefined) {
      targetID = buttonModel.transitions._any
    }
    if (targetID !== undefined) {
      this._presentScreen(targetID)
      return
    }

    if (buttonModel.tooltip.match(/##input##/)) {
      this.setState({buttonToExpand: buttonModel})
    } else {
      this.props.onButtonClick(buttonModel)
    }
  }

  private _presentScreen = (screenID: string) => {
    this.setState(() => {
      this.props.didChangeScreen(screenID)
      return {selectedScreenID: screenID}
    })
  }

  private _templateEditor = () => {
    if (this.state.buttonToExpand === undefined) {
      return null
    }

    return (
        <TemplateEditor
            onCancel={() => this.setState({buttonToExpand: undefined})}
            onConfirm={(newTooltip) => {
              const filledModel = Object
                  .assign({},
                      this.state.buttonToExpand,
                      {tooltip: newTooltip})
              this.props.onButtonClick(filledModel)
              this.setState({buttonToExpand: undefined})
            }}
            text={this.state.buttonToExpand.tooltip}/>
    )
  }

  constructor(props: IWozProperties) {
    super(props)

    this.state = {
      selectedScreenID: props.selectedScreenID !== undefined
                        ? props.selectedScreenID : Object.keys(
              props.woz.screens)[0],
    }
  }

  public render() {

    const extraRows = arrayMap(this.props.persistentRows
                                   .filter((row) => row.buttons !== undefined),
        (row: IRowModel, index: number) => {
          return (
              <Row
                  key={[row.label, row.id, index.toString()].join("-")}
                  context={this.props.woz}
                  buttons={row.buttons}
                  label={row.label}
                  index={index}
                  onButtonClick={this._handleClick}/>
          )
        })

    return (
        <div className={css.scrollable}>
          <div>
            {extraRows}
            {this._templateEditor()}
            <Screen
                context={this.props.woz}
                identifier={this.state.selectedScreenID}
                onButtonClick={this._handleClick}/>
          </div>
        </div>
    )
  }
}
