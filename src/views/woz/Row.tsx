//
//  Row
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as React from "react";
import * as util from "../../util";
import {Button} from "./Button";
import {WozModel} from "./WozModel";

interface IRowProperties {
  index: number;
  data: WozModel;
  buttons: string[];
  onButtonClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  label: string;
}

export class Row extends React.Component<IRowProperties, {}> {

  public render() {
    const data = this.props.data;
    const className = ((this.props.index % 2) === 1) ? "odd" : "even";
    const onButtonClick = this.props.onButtonClick;

    if (!util.defined(this.props.buttons)) {
      return null;
    }

    const buttons = this.props.buttons.map( (buttonID, index) => {
      const buttonModel = data.buttons[buttonID];
      if (util.defined(buttonModel)) {
        return (
            <Button key={index} data={data} identifier={buttonID}
                           onclick={onButtonClick.bind(onButtonClick, buttonID)}/>
        );
      } else if (buttonID === Button.placeholderID) {
        return (
            <div key={index} className="woz_button woz_placeholder"/>
        );
      } else {
        return (
            <div key={index}/>
        );
      }
    });

    return (
        <div className={className}>
          <div key="header" className="woz_row_header">
            {this.props.label}
          </div>
          <div key="content" className="row-content">
            {buttons}
          </div>
        </div>
    );
  }
}
