import * as React from "react";
import {arrayMap} from "../../common/util";
import {IButtonModel} from "../model/ButtonModel";
import {IRowModel} from "../model/RowModel";
import {IWozContext} from "../model/WozModel";
import {Row} from "./Row";
import {Screen} from "./Screen";
import css from "./woz.module.css";
import {ButtonClickCallback} from "./WozCollection";

interface IWozProperties {
  onButtonClick: ButtonClickCallback;
  didChangeScreen: (screenID: string) => void;
  persistentRows: IRowModel[];
  woz: IWozContext;
  selectedScreenID?: string;
}

interface IWozState {
  selectedScreenID: string;
}

export class Woz extends React.Component<IWozProperties, IWozState> {

  constructor(props: IWozProperties) {
    super(props);

    this.state = {
      selectedScreenID: props.selectedScreenID !== undefined
          ? props.selectedScreenID : Object.keys(props.woz.screens)[0],
    };
  }

  public render() {

    const extraRows = arrayMap(this.props.persistentRows
            .filter((row) => row.buttons !== undefined),
        (row: IRowModel, index: number) => {
          return (
              <Row
                  key={[row.label, row.id, index.toString()].join("-")}
                  context={this.props.woz}
                  buttons={row.buttons}
                  label={row.label}
                  index={index}
                  onButtonClick={this._handleClick}/>
          );
        });

    return (
        <div className={css.scrollable}>
          <div>
            {extraRows}
            <Screen
                context={this.props.woz}
                identifier={this.state.selectedScreenID}
                onButtonClick={this._handleClick}/>
          </div>
        </div>
    );
  }

  private _handleClick = (buttonModel: IButtonModel) => {
    if (this.state.selectedScreenID === undefined) {
      return;
    }

    let targetID = buttonModel.transitions[this.state.selectedScreenID];
    if (targetID === undefined) {
      targetID = buttonModel.transitions._any;
    }
    if (targetID !== undefined) {
      this._presentScreen(targetID);
      return;
    }

    this.props.onButtonClick(buttonModel);
  }

  private _presentScreen = (screenID: string) => {
    this.setState(() => {
      this.props.didChangeScreen(screenID);
      return {selectedScreenID: screenID};
    });
  }

}
