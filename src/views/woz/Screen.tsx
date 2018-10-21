//
//  Screen
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as React from 'react';
import * as Row from './Row';
import * as Model from "./Model";

interface ScreenProperties {
  identifier: string;
  data: Model.WozModel;
  onButtonClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export class Screen extends React.Component<ScreenProperties, {}> {

  render() {
    let data = this.props.data;
    let screenModel = data.screens[this.props.identifier];
    let screenTitle = (screenModel || {}).label || this.props.identifier;
    let onButtonClick = this.props.onButtonClick;
    console.log(data);
    console.log(this.props.identifier);
    console.log(screenModel);

    let rows = screenModel.rows.map(function (rowID, rowIndex) {
      let rowModel = data.rows[rowID];
      let buttonList = rowModel.buttons;
      return (
          <Row.Row key={rowID}
               data={data}
               buttons={buttonList}
               label={rowModel.label}
               index={rowIndex} onButtonClick={onButtonClick}/>
      );
    });
    return (
        <div className="screen">
          <div className="screen-title">
            {screenTitle}
          </div>
          <div>
            {rows}
          </div>
        </div>
    )
  }
}
