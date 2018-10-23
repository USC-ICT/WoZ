//
//  Screen
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as React from "react";
// import {log} from "../controller/Logger";
import {IButtonModel} from "../model/ButtonModel";
import {IWozContext} from "../model/WozModel";
import {Row} from "./Row";

interface IScreenProperties {
  context: IWozContext;
  identifier?: string;
  onButtonClick: (button: IButtonModel) => void;
}

export class Screen extends React.Component<IScreenProperties, {}> {

  public render() {
    if (this.props.identifier === undefined) { return null; }
    const screenModel = this.props.context.screens[this.props.identifier];
    const screenTitle = screenModel.label || this.props.identifier;
    // log.debug(selectedWoz);
    // log.debug(this.props.identifier);
    // log.debug(screenModel);

    const rows = screenModel.rows.map((rowID, rowIndex) => {
      const rowModel = this.props.context.rows[rowID];
      return (
          <Row key={rowID}
               context={this.props.context}
               buttons={rowModel.buttons}
               label={rowModel.label}
               index={rowIndex}
               onButtonClick={this.props.onButtonClick}/>
      );
    });
    return (
        <div className="woz_screen">
          <div className="woz_screen_title">
            {screenTitle}
          </div>
          <div>
            {rows}
          </div>
        </div>
    );
  }
}
