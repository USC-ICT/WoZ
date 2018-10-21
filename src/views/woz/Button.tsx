//
//  Button
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as React from "react";
import * as OverlayTrigger from "react-bootstrap/lib/OverlayTrigger";
import * as Tooltip from "react-bootstrap/lib/Tooltip";
import * as util from "../../util";
import * as Label from "./Label";
import {WozModel} from "./WozModel";

function hex(x) {
  const h = "000000" + Number(x).toString(16);
  return h.substr(h.length - 2, 2);
}

interface IButtonProperties {
  data: WozModel;
  identifier: string;
  onclick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export class Button extends React.Component<IButtonProperties, {}> {

  public static placeholderID: string;

  public render() {
    const data = this.props.data;
    const buttonModel = data.buttons[this.props.identifier];

    const badges = Object.keys(buttonModel.badges)
        .map((badgeID) =>
            <span key={badgeID}
                  className={"badge " + badgeID}>{buttonModel.badges[badgeID]}</span>);

    const buttonColor = data.colors[buttonModel.color];
    const buttonStyle = util.defined(buttonColor) ? {
      background: "#" + hex(buttonColor.r) + hex(buttonColor.g) + hex(buttonColor.b),
    } : {};

    const tooltip = (
        <Tooltip id="tooltip">
          {buttonModel.tooltip}
        </Tooltip>
    );

    return (
        <OverlayTrigger overlay={tooltip} placement={"bottom"}>
          <div className="woz_button woz_selectable"
               onClick={this.props.onclick}
               style={buttonStyle}>
            {badges}
            <Label.Label model={buttonModel}>{buttonModel.label}</Label.Label>
          </div>
        </OverlayTrigger>
    );
  }
}

Button.placeholderID = "__placeholder__";
