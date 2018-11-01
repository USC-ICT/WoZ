import {IButtonModel} from "../../woz/model/ButtonModel"
import {Store} from "../Store"
import {ConsoleConnector} from "./console/ConsoleConnector"
import {FirebaseConnector} from "./firebase/FirebaseConnector"
import {VHMSGConnector} from "./vhmsg/VHMSGConnector"

export interface IWozConnector {
  id: string
  title: string

  component(): any
  onButtonClick(buttonModel: IButtonModel): void
}

export class WozConnectors {
  public static shared = new WozConnectors()

  public readonly all: IWozConnector[]

  constructor() {
    this.all = [
      new ConsoleConnector(),
      new FirebaseConnector(),
      new VHMSGConnector(),
    ]
  }

  public get selectedConnectorID(): string {
    const currentID = Store.shared.selectedConnectorID === undefined
      ? this.all[0].id : Store.shared.selectedConnectorID
    return this.all.find(
        (c) => c.id === currentID) !== undefined
        ? currentID : this.all[0].id
  }

  // noinspection JSMethodCanBeStatic
  public set selectedConnectorID(newValue: string) {
    Store.shared.selectedConnectorID = newValue
  }

  public get selectedConnector(): IWozConnector {
    const connector = this.all.find((c) => c.id === this.selectedConnectorID)
    if (connector !== undefined) { return connector }
    return this.all[0]
  }
}
