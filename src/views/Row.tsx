//
//  Row
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as React from "react";
import {WozModel} from "../model/WozModel";
import * as util from "../util";
import {Button} from "./Button";

interface IRowProperties {
  buttons: string[];
  data: WozModel;
  index: number;
  label: string;
  onButtonClick: (id: string) => void;
}

export class Row extends React.Component<IRowProperties, {}> {

  public render() {
    const data = this.props.data;
    const className = ((this.props.index % 2) === 1) ? "odd" : "even";

    if (!util.defined(this.props.buttons)) {
      return null;
    }

    const buttons = this.props.buttons.map( (buttonID, index) => {
      const buttonModel = data.buttons[buttonID];
      if (util.defined(buttonModel)) {
        return (
            <Button key={index} data={data} identifier={buttonID}
                    onButtonClick={this.props.onButtonClick}/>
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
