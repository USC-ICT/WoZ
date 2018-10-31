import * as React from "react";
import {Button, Input, Modal} from "semantic-ui-react";
import {arrayMap} from "../../common/util";
import {ButtonModel, IButtonModel} from "../model/ButtonModel";
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
  buttonToExpand?: ButtonModel;
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
            {this._templateEditor()}
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

    if (buttonModel.tooltip.match(/##input##/)) {
      this.setState({buttonToExpand: buttonModel});
    } else {
      this.props.onButtonClick(buttonModel);
    }
  }

  private _presentScreen = (screenID: string) => {
    this.setState(() => {
      this.props.didChangeScreen(screenID);
      return {selectedScreenID: screenID};
    });
  }

  private _templateEditor = () => {
    if (this.state.buttonToExpand === undefined) { return null; }

    const closeTemplateEditor = () => { this.setState({buttonToExpand: undefined}); };

    const text = this.state.buttonToExpand.tooltip.split(/##input##/);

    const result = [text[0]].concat(text.slice(1).reduce((previousValue: any[], currentValue) => {
      return previousValue.concat(["", currentValue]);
    }, []));

    const components = [text[0]].concat(text.slice(1).reduce((previousValue: any[], currentValue, index) => {
      return previousValue.concat([
          <Input key={index} onChange={(_e, data) => result[index * 2 + 1] = data.value }/>,
          currentValue]);
    }, []));

    const closeAndSendTemplateEditor = () => {
      const newTooltip = result.join("");
      const filledModel = Object.assign({}, this.state.buttonToExpand, {tooltip: newTooltip});
      this.props.onButtonClick(filledModel);
      this.setState({buttonToExpand: undefined});
    };

    return (
            <Modal
                dimmer={"blurring"}
                closeOnEscape={true}
                closeOnDimmerClick={true}
                onClose={closeTemplateEditor}
                open={true}>
              <Modal.Header>Fill out the form.</Modal.Header>
              <Modal.Content>
                {components}
              </Modal.Content>
              <Modal.Actions>
                <Button secondary content="Cancel" onClick={closeTemplateEditor}/>
                <Button
                    primary
                    content="Send"
                    onClick={closeAndSendTemplateEditor}
                />
              </Modal.Actions>
            </Modal>
        );

  }
}
