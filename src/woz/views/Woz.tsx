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
import {IButtonModel} from "../model/ButtonModel"
import {IPersistentRowModel} from "../model/RowModel"
import {IWozContext} from "../model/WozModel"
import {Row} from "./Row"
import {Screen} from "./Screen"
import {TemplateEditor} from "./TemplateEditor"
import css from "./woz.module.css"
import {ButtonClickCallback} from "./WozCollection"

interface IWozProperties {
  onButtonClick: ButtonClickCallback
  onScreenChange: (screenID: string) => void
  persistentRows: IPersistentRowModel[]
  woz: IWozContext
  selectedScreenID: string
}

interface IWozState {
  buttonToExpand?: IButtonModel
}

export class Woz extends React.Component<IWozProperties, IWozState> {

  private _handleClick = (buttonModel: IButtonModel) => {
    let targetID = buttonModel.transitions[this.props.selectedScreenID]

    // noinspection JSIncompatibleTypesComparison
    if (targetID === undefined) {
      targetID = buttonModel.transitions._any
    }

    // noinspection JSIncompatibleTypesComparison
    if (targetID !== undefined) {
      this.props.onScreenChange(targetID)
      return
    }

    if (/##.*?##/.exec(buttonModel.tooltip)) {
      this.setState({buttonToExpand: buttonModel})
    } else {
      this.props.onButtonClick(buttonModel)
    }
  }

  private _templateEditor = () => {
    if (this.state.buttonToExpand === undefined) {
      return null
    }

    return <TemplateEditor
            onCancel={() => this.setState({buttonToExpand: undefined})}
            onConfirm={(newTooltip) => {
              const filledModel = Object
                  .assign({}, this.state.buttonToExpand, newTooltip)
              this.props.onButtonClick(filledModel)
              this.setState({buttonToExpand: undefined})
            }}
            text={this.state.buttonToExpand.tooltip}/>

  }

  constructor(props: IWozProperties) {
    super(props)
    this.state = {}
  }

  public render(): React.ReactNode {

    const extraRows = arrayMap(
        this.props.persistentRows,
        (row: IPersistentRowModel, index: number) => {
          return (
              <Row
                  key={[row.label, row.id, index.toString()].join("-")}
                  context={this.props.woz}
                  buttons={row.buttons}
                  rows={row.rows}
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
                identifier={this.props.selectedScreenID}
                onButtonClick={this._handleClick}/>
          </div>
        </div>
    )
  }
}
