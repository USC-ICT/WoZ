//
//  Row
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as util from '../../util.js';
import Button from './Button.js';
import React from 'react';

export default class Row extends React.Component {

  render() {
    let data = this.props.data;
    let className = ((this.props.index % 2) === 1) ? "odd" : "even";
    let handleClick = this.props.onclick;
    let onButtonClick = this.props.onButtonClick;

    if (!util.defined(this.props.buttons)) {
      return null;
    }

    let buttons = this.props.buttons.map(function (buttonID, index) {
      let buttonModel = data.buttons[buttonID];

      if (!util.defined(buttonModel)) {
        if (buttonID === Button.placeholderID) {
          return (
              <div key={index} className="button placeholder"/>
          );
        } else {
          return (
              <div key={index}/>
          );
        }
      }

      return (
          <Button key={index} data={data} identifier={buttonID}
                  onclick={onButtonClick.bind(onButtonClick, buttonID)}/>
      );
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
