import * as React from "react";
import {Store} from "../../../model/Store";
import {IWozConnector} from "../Connector";
import {VHMSG} from "./vhmsg";
import {VHMSGConnectorComponent} from "./VHMSGConnectorComponent";

export class VHMSGConnector implements IWozConnector {
  public readonly id: string;
  public readonly title: string;
  public readonly vhmsg: VHMSG;

  constructor() {
    this.id = this.constructor.name;
    this.title = "VHMSG";
    this.vhmsg = new VHMSG(Store.shared.vhmsg);
  }

  public component = (): any => {
    return React.createElement(VHMSGConnectorComponent, {vhmsg: this.vhmsg}, null);
  }
}
