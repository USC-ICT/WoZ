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
import {WozModel} from "../model/WozModel";
import {Label} from "./Label";

interface IButtonProperties {
  data: WozModel;
  identifier: string;
  onButtonClick: (id: string) => void;
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

    const buttonStyle = buttonModel.color && data.colors[buttonModel.color] ? {
      background: data.colors[buttonModel.color].css,
    } : {};

    const tooltip = (
        <Tooltip id="tooltip">
          {buttonModel.tooltip}
        </Tooltip>
    );

    return (
        <OverlayTrigger overlay={tooltip} placement={"bottom"}>
          <div className="woz_button woz_selectable"
               onClick={() => { this.props.onButtonClick(this.props.identifier); }}
               style={buttonStyle}>
            {badges}
            <Label model={buttonModel}>{buttonModel.label}</Label>
          </div>
        </OverlayTrigger>
    );
  }
}

Button.placeholderID = "__placeholder__";
