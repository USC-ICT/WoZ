//
//  Button
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import {defined} from '../../util.js';
import Label from './Label.js';
import React from 'react';

function hex(x) {
  let h = "000000" + Number(x).toString(16);
  return h.substr(h.length - 2, 2);
}

export default class Button extends React.Component {

  render() {
    let data = this.props.data;
    let buttonModel = data.buttons[this.props.identifier];

    let theToolTip = (buttonModel || {}).tooltip || "";
    let theLabel = ((buttonModel || {}).label || "").trim();

    let badges = [];
    for (let badge_id in buttonModel.badges) {
      if (buttonModel.badges.hasOwnProperty(badge_id)) {
        const badge = buttonModel.badges[badge_id];
        badges.push(
            <span key={badge_id}
                  className={"badge " + badge_id}>{badge}</span>
        );
      }
    }

    let buttonColor = data.colors[buttonModel.color];
    let buttonStyle = {};

    if (defined(buttonColor)) {
      buttonStyle["background"] =
          '#' + hex(buttonColor.r) + hex(buttonColor.g) + hex(buttonColor.b);
    }

    return (
        <div className="button selectable"
             title={theToolTip}
             onClick={this.props.onclick}
             style={buttonStyle}>
          {badges}
          <Label model={buttonModel}>{theLabel}</Label>
        </div>
    )
  }
}

Button.placeholderID = "__placeholder__";
