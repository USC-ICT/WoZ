import * as React from "react";
import {log} from "../../../controller/Logger";
import {IButtonModel} from "../../../model/ButtonModel";
import {IWozConnector} from "../Connector";
import {FirebaseConnectorComponent} from "./FirebaseConnectorComponent";

export class FirebaseConnector implements IWozConnector {
  public readonly id: string;
  public readonly title: string;

  constructor() {
    this.id = this.constructor.name;
    this.title = "Firebase";
  }

  public component = (): any => {
    return React.createElement(FirebaseConnectorComponent, {}, null);
  }
  public onButtonClick = (buttonModel: IButtonModel) => {
    log.debug("clicked:", "'" + buttonModel.id + "'", buttonModel.tooltip);
  }
}
