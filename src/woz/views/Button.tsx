//
//  Button
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as React from "react";
import {Popup} from "semantic-ui-react";
import {objectMap} from "../../common/util";
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
      return (
          <div className="woz_button woz_missing_button">
            <Label model={{}}>Missing button with ID {this.props.identifier}</Label>
          </div>
      );
    }

    const badges = objectMap(buttonModel.badges,
        ([badgeID, badgeText]) =>
            <span key={badgeID}
                  className={"woz_badge " + badgeID}>{badgeText}</span>);

    const buttonStyle = buttonModel.color !== undefined
    && this.props.context.colors[buttonModel.color] !== undefined ? {
      background: this.props.context.colors[buttonModel.color].css,
    } : {};

    const button = (
        <div className="woz_button woz_selectable"
             onClick={() => {
               this.props.onButtonClick(buttonModel);
             }}
             style={buttonStyle}>
          {badges}
          <Label model={buttonModel}>{buttonModel.label}</Label>
        </div>
    );

    return (
        <Popup inverted={true} trigger={button} content={buttonModel.tooltip}/>
    );
  }
}

Button.placeholderID = "__placeholder__";
