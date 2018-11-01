//
//  Screen
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as React from "react"
import {Message} from "semantic-ui-react"
import {arrayMap} from "../../common/util"
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

export class Screen extends React.Component<IScreenProperties, {}> {

  public render() {
    if (this.props.identifier === undefined) {
      return null
    }
    const screenModel = this.props.context.screens[this.props.identifier]
    const screenTitle = screenModel.label || this.props.identifier
    // log.debug(selectedWoz);
    // log.debug(this.props.identifier);
    // log.debug(screenModel);

    const rows = arrayMap(screenModel.rows, (rowID, rowIndex) => {
      const rowModel = this.props.context.rows[rowID]
      if (rowModel !== undefined) {
        return (
            <Row
                key={rowID}
                context={this.props.context}
                buttons={rowModel.buttons}
                label={rowModel.label}
                index={rowIndex}
                onButtonClick={this.props.onButtonClick}/>
        )
      }

      return (
        <Message key={rowID} negative style={{marginLeft: "5%", width: "90%"}}>
          Missing row with ID {rowID}.
        </Message>
      )
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
