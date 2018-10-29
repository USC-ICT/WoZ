import * as React from "react";
import {log} from "../../../common/Logger";
import {IButtonModel} from "../../../woz/model/ButtonModel";
import {IWozConnector} from "../Connector";
import {ConsoleConnectorComponent} from "./ConsoleConnectorComponent";

export class ConsoleConnector implements IWozConnector {

  public readonly id: string;
  public readonly title: string;

  constructor() {
    this.id = "ConsoleConnector";
    this.title = "Console";
  }

  public component = (): any => {
    return React.createElement(ConsoleConnectorComponent, {}, null);
  }

  // noinspection JSUnusedGlobalSymbols
  public onButtonClick = (buttonModel: IButtonModel) => {
    log.debug("clicked:", "'" + buttonModel.id + "'", buttonModel.tooltip);
  }
}
