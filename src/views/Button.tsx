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
import {IButtonModel} from "../model/ButtonModel";
import {IWozContext} from "../model/WozModel";
import {Label} from "./Label";

interface IButtonProperties {
  identifier: string;
  context: IWozContext;
  onButtonClick: (buttonModel: IButtonModel) => void;
}

export class Button extends React.Component<IButtonProperties, {}> {

  public static placeholderID: string;

  public render() {
    const buttonModel = this.props.context.buttons[this.props.identifier];
    if (buttonModel === undefined) {
      return null;
    }

    const badges = Object.entries(buttonModel.badges)
        .map(([badgeID, badgeText]) =>
            <span key={badgeID}
                  className={"badge " + badgeID}>{badgeText}</span>);

    const buttonStyle =
        buttonModel.color !== undefined
        && this.props.context.colors[buttonModel.color] !== undefined ? {
          background: this.props.context.colors[buttonModel.color].css,
        } : {};

    const tooltip = (
        <Tooltip id="tooltip">
          {buttonModel.tooltip}
        </Tooltip>
    );

    return (
        <OverlayTrigger overlay={tooltip} placement={"bottom"}>
          <div className="woz_button woz_selectable"
               onClick={() => {
                 this.props.onButtonClick(buttonModel);
               }}
               style={buttonStyle}>
            {badges}
            <Label
                model={buttonModel}>{buttonModel.label}</Label>
          </div>
        </OverlayTrigger>
    );
  }
}

Button.placeholderID = "__placeholder__";
