//
//  Screen
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as React from "react";
// import {log} from "../controller/Logger";
import {WozModel} from "../model/WozModel";
import {Row} from "./Row";

interface IScreenProperties {
  data: WozModel;
  identifier: string;
  onButtonClick: (id: string) => void;
}

export class Screen extends React.Component<IScreenProperties, {}> {

  public render() {
    const data = this.props.data;
    const screenModel = data.screens[this.props.identifier];
    const screenTitle = screenModel.label || this.props.identifier;
    // log.debug(selectedWoz);
    // log.debug(this.props.identifier);
    // log.debug(screenModel);

    const rows = screenModel.rows.map((rowID, rowIndex) => {
      const rowModel = data.rows[rowID];
      const buttonList = rowModel.buttons;
      return (
          <Row key={rowID}
               data={data}
               buttons={buttonList}
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
