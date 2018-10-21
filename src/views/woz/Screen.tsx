//
//  Screen
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as React from "react";
import * as Row from "./Row";
import {WozModel} from "./WozModel";

interface IScreenProperties {
  identifier: string;
  data: WozModel;
  onButtonClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export class Screen extends React.Component<IScreenProperties, {}> {

  public render() {
    const data = this.props.data;
    const screenModel = data.screens[this.props.identifier];
    const screenTitle = screenModel.label || this.props.identifier;
    const onButtonClick = this.props.onButtonClick;
    console.log(data);
    console.log(this.props.identifier);
    console.log(screenModel);

    const rows = screenModel.rows.map((rowID, rowIndex) => {
      const rowModel = data.rows[rowID];
      const buttonList = rowModel.buttons;
      return (
          <Row.Row key={rowID}
               data={data}
               buttons={buttonList}
               label={rowModel.label}
               index={rowIndex} onButtonClick={onButtonClick}/>
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
