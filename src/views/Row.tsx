//
//  Row
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as React from "react";
import {IButtonModel} from "../model/ButtonModel";
import {IWozContext} from "../model/WozModel";
import {Button} from "./Button";

interface IRowProperties {
  buttons?: string[];
  context: IWozContext;
  index: number;
  label: string;
  onButtonClick: (buttonModel: IButtonModel) => void;
}

export class Row extends React.Component<IRowProperties, {}> {

  public render() {
    if (this.props.buttons === undefined) {
      return null;
    }

    const className = ((this.props.index % 2) === 1) ? "odd" : "even";
    const buttons = this.props.buttons.map((buttonID, index) => {
      const buttonModel = this.props.context.buttons[buttonID];
      if (buttonModel !== undefined) {
        return (
            <Button key={index}
                    context={this.props.context}
                    identifier={buttonID}
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
