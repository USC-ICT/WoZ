//
//  Row
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as React from "react";
import {arrayMap} from "../../common/util";
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

    const className = "woz_row " + (((this.props.index % 2) === 1)
        ? "odd" : "even");

    const seenKeys = new Set<string>();

    const buttons = arrayMap(this.props.buttons, (buttonID, index) => {
      // the key must be unique among siblings, but we may have the same
      // button added multiple times
      let key = buttonID;
      while (seenKeys.has(key)) {
        key = key + "_";
      }
      seenKeys.add(key);

      if (buttonID === Button.placeholderID) {
        return (
            <div key={index} className="woz_button woz_placeholder"/>
        );
      }

      return (
          <Button
              key={key}
              context={this.props.context}
              identifier={buttonID}
              onButtonClick={this.props.onButtonClick}/>
      );
    });

    return (
        <div className={className}>
          <div key="header" className="woz_row_header">
            {this.props.label}
          </div>
          <div key="content" className="woz_row_content">
            {buttons}
          </div>
        </div>
    );
  }
}
