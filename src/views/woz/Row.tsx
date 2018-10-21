//
//  Row
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as util from '../../util'
import * as Button from './Button'
import * as React from 'react'
import * as Model from './Model'

interface RowProperties {
  index: number;
  data: Model.WozModel;
  buttons: Array<string>;
  onButtonClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  label: string;
}

export class Row extends React.Component<RowProperties, {}> {

  render() {
    let data = this.props.data;
    let className = ((this.props.index % 2) === 1) ? "odd" : "even";
    let onButtonClick = this.props.onButtonClick;

    if (!util.defined(this.props.buttons)) {
      return null;
    }

    let buttons = this.props.buttons.map( (buttonID, index) => {
      let buttonModel = data.buttons[buttonID];
      if (util.defined(buttonModel)) {
        return (
            <Button.Button key={index} data={data} identifier={buttonID}
                           onclick={onButtonClick.bind(onButtonClick, buttonID)}/>
        );
      } else if (buttonID === Button.Button.placeholderID) {
        return (
            <div key={index} className="button placeholder"/>
        );
      } else {
        return (
            <div key={index}/>
        );
      }
    });

    return (
        <div className={className}>
          <div key="header" className="row-header">
            {this.props.label}
          </div>
          <div key="content" className="row-content">
            {buttons}
          </div>
        </div>
    )
  }
}
