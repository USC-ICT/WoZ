import * as React from "react";
import {log} from "../../../common/Logger";
import {stringEncodingHTML} from "../../../common/util";
import {IButtonModel} from "../../../woz/model/ButtonModel";
import {Store} from "../../Store";
import {IWozConnector} from "../Connector";
import {VHMSG} from "./vhmsg";
import {VHMSGConnectorComponent} from "./VHMSGConnectorComponent";

export class VHMSGConnector implements IWozConnector {
  public readonly id: string;
  public readonly title: string;
  public readonly vhmsg: VHMSG;
  private messageCount: number = 0;

  constructor() {
    this.id = "VHMSGConnector";
    this.title = "VHMSG";
    this.vhmsg = new VHMSG(Store.shared.vhmsg);
  }

  public component = (): any => {
    return React.createElement(VHMSGConnectorComponent, {vhmsg: this.vhmsg}, null);
  }

  // noinspection JSUnusedGlobalSymbols
  public onButtonClick = (buttonModel: IButtonModel) => {

    const buttonModelCopy = Object.assign({}, buttonModel);

    const h = "000000" + Number(this.messageCount++).toString();
    buttonModelCopy.messageCount = h.substr(h.length - 5, 5);

    const message = this._messageTemplate(buttonModelCopy)
        .replace(/\$\$XML\((.*?)\)\$\$/g, (_match, property) => {
          return stringEncodingHTML(
              buttonModelCopy[property] === undefined ? "" : buttonModelCopy[property]);
        })
        .replace(/\$\$(.*?)\$\$/g, (_match, property) => {
          return buttonModelCopy[property] === undefined ? "" : buttonModelCopy[property];
        });

    log.debug("sending:", message);
    this.vhmsg.send(message);
  }

  private _messageTemplate = (buttonModel: IButtonModel): string => {
    if (buttonModel.vhmsg === undefined) {
      if (buttonModel.sender === undefined) {
        buttonModel.sender = "visitor";
      }
      if (buttonModel.addressee === undefined) {
        buttonModel.addressee = "all";
      }
      //noinspection SpellCheckingInspection
      buttonModel.vhmsg = "vrExpress $$sender$$ $$addressee$$ $$sender$$$$messageCount$$ "
          + '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>'
          + '<act><participant id="$$XML(sender)$$" role="actor" /><fml><turn start="take" end="give" />'
          + '<affect type="neutral" target="addressee"></affect><culture type="neutral"></culture>'
          + '<personality type="neutral"></personality></fml><bml><speech id="sp1" ref="'
          + "$$XML(id)$$"
          + '" type="application/ssml+xml">'
          + "$$XML(tooltip)$$"
          + "</speech></bml></act>";
      return buttonModel.vhmsg;
    } else if (typeof buttonModel.vhmsg === "string") {
      return buttonModel.vhmsg;
    } else {
      return "";
    }
  }
}
