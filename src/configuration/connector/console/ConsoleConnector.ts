import * as React from "react";
import {log} from "../../../controller/Logger";
import {IButtonModel} from "../../../model/ButtonModel";
import {IWozConnector} from "../Connector";
import {ConsoleConnectorComponent} from "./ConsoleConnectorComponent";

export class ConsoleConnector implements IWozConnector {

  public readonly id: string;
  public readonly title: string;

  constructor() {
    this.id = this.constructor.name;
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
