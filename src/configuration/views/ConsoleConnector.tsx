import * as React from "react";
import {IWozConnector} from "./ConfigurationEditor";

export class ConsoleConnector extends React.Component<{}, {}> implements IWozConnector {

  public readonly id: string;
  public readonly title: string;

  constructor(props: any) {
    super(props);
    this.id = "ConsoleConnector";
    this.title = "Console";
  }

  public render() {
    return (
        <div>
          We will render the button result onto the browser console.
        </div>
    );
  }
}
