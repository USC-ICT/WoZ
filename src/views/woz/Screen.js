//
//  Screen
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//
import * as React from 'react';
import * as Row from './Row';
export class Screen extends React.Component {
    render() {
        let data = this.props.data;
        let screenModel = data.screens[this.props.identifier];
        let screenTitle = (screenModel || {}).label || this.props.identifier;
        let onButtonClick = this.props.onButtonClick;
        console.log(data);
        console.log(this.props.identifier);
        console.log(screenModel);
        let rows = screenModel.rows.map(function (rowID, rowIndex) {
            let rowModel = data.rows[rowID];
            let buttonList = rowModel.buttons;
            return (React.createElement(Row.Row, { key: rowID, data: data, buttons: buttonList, label: rowModel.label, index: rowIndex, onButtonClick: onButtonClick }));
        });
        return (React.createElement("div", { className: "woz_screen" },
            React.createElement("div", { className: "woz_screen_title" }, screenTitle),
            React.createElement("div", null, rows)));
    }
}
//# sourceMappingURL=Screen.js.map