//
//  Button
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as util from '../../util';
import * as Label from './Label';
import * as React from 'react';
import * as Model from './Model';
import * as Tooltip from 'react-bootstrap/lib/Tooltip';
import * as OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";

function hex(x) {
  let h = "000000" + Number(x).toString(16);
  return h.substr(h.length - 2, 2);
}


export class Button extends React.Component<Model.ButtonProperties, {}> {

  static placeholderID: string;

  render() {
    let data = this.props.data;
    let buttonModel = data.buttons[this.props.identifier];

    let badges = Object.keys(buttonModel.badges)
        .map(badge_id =>
            <span key={badge_id}
                  className={"badge " + badge_id}>{buttonModel.badges[badge_id]}</span>);

    let buttonColor = data.colors[buttonModel.color];
    let buttonStyle = {};

    if (util.defined(buttonColor)) {
      buttonStyle["background"] =
          '#' + hex(buttonColor.r) + hex(buttonColor.g) + hex(buttonColor.b);
    }

    const tooltip = (
        <Tooltip id="tooltip">
          {buttonModel.tooltip}
        </Tooltip>
    );

    return (
        <OverlayTrigger overlay={tooltip} placement={"bottom"}>
          <div className="woz_button woz_selectable"
              // title={buttonModel.tooltip}
               onClick={this.props.onclick}
               style={buttonStyle}>
            {badges}
            <Label.Label model={buttonModel}>{buttonModel.label}</Label.Label>
          </div>
        </OverlayTrigger>
    )
  }
}

Button.placeholderID = "__placeholder__";
