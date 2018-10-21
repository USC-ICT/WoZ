//
//  Row
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//
import * as util from '../../util';
import * as Button from './Button';
import * as React from 'react';
export class Row extends React.Component {
    render() {
        let data = this.props.data;
        let className = ((this.props.index % 2) === 1) ? "odd" : "even";
        let onButtonClick = this.props.onButtonClick;
        if (!util.defined(this.props.buttons)) {
            return null;
        }
        let buttons = this.props.buttons.map((buttonID, index) => {
            let buttonModel = data.buttons[buttonID];
            if (util.defined(buttonModel)) {
                return (React.createElement(Button.Button, { key: index, data: data, identifier: buttonID, onclick: onButtonClick.bind(onButtonClick, buttonID) }));
            }
            else if (buttonID === Button.Button.placeholderID) {
                return (React.createElement("div", { key: index, className: "woz_button woz_placeholder" }));
            }
            else {
                return (React.createElement("div", { key: index }));
            }
        });
        return (React.createElement("div", { className: className },
            React.createElement("div", { key: "header", className: "woz_row_header" }, this.props.label),
            React.createElement("div", { key: "content", className: "row-content" }, buttons)));
    }
}
//# sourceMappingURL=Row.js.map