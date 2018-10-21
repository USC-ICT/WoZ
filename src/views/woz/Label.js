//
//  Label
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as util from '../../util.js';
import React from 'react';
import ReactDOM from 'react-dom'

let BUTTON_LABEL_MIN_FONT_SIZE = 5;

export default class Label extends React.Component {

  constructor(props)
  {
    super(props);
    this.state = {
      fontSize: (props.model || {}).fontSize || 0,
      ready: util.defined((props.model || {}).fontSize),
      smallestUnacceptableFontSize: 0,
      largestAcceptableFontSize: BUTTON_LABEL_MIN_FONT_SIZE
    };

  }

  componentDidMount()
  {
    this._computeSizeIfNeeded();
  }

  componentDidUpdate()
  {
    this._computeSizeIfNeeded();
  }

  _computeSizeIfNeeded() {
    if (this.state.ready) {
      return;
    }

    const el = ReactDOM.findDOMNode(this);

    if (this.state.fontSize === 0) {
      const parent = el.parentNode;

      // inner dimensions. subtract padding.
      const parentStyle = window.getComputedStyle(parent);
      this.state.parentWidth = parent.clientWidth
                               - parseInt(parentStyle["padding-left"], 10)
                               - parseInt(parentStyle["padding-right"], 10);
      this.state.parentHeight = parent.clientHeight
                                - parseInt(parentStyle["padding-top"], 10)
                                - parseInt(parentStyle["padding-bottom"], 10);

      // we should only compute the size if the node is visible = its parent is
      // visible
      if (this.state.parentWidth <= 0) {
        return;
      }
      this.state.fontSize =
          parseInt(window.getComputedStyle(el)["font-size"], 10);
      this.state.smallestUnacceptableFontSize = this.state.fontSize;
    }

    if (this.state.fontSize <= this.state.largestAcceptableFontSize) {

      this.setState(function (prevState) {
        let fontSize = Math.max(prevState.fontSize, BUTTON_LABEL_MIN_FONT_SIZE);
        this.props.model.fontSize = fontSize; // cache it
        return {
          ready: true,
          fontSize: fontSize
        }
      }.bind(this));

    } else if (el.clientHeight > this.state.parentHeight ||
               el.clientWidth > this.state.parentWidth) {

      this.setState(function (prevState) {
        return {
          smallestUnacceptableFontSize: prevState.fontSize,
          fontSize: Math.floor((prevState.largestAcceptableFontSize +
                                prevState.fontSize) / 2)
        }
      });

    } else if (this.state.fontSize <
               this.state.smallestUnacceptableFontSize - 1) {

      this.setState(function (prevState) {
        return {
          largestAcceptableFontSize: prevState.fontSize,
          fontSize: Math.floor((prevState.fontSize +
                                prevState.smallestUnacceptableFontSize) / 2)
        }
      });

    } else {

      this.setState(function (prevState) {
        this.props.model.fontSize = prevState.fontSize; // cache it
        return {
          ready: true,
        }
      }.bind(this));

    }

  }

  render() {

    let buttonStyle = {};
    if (this.state.fontSize !== 0) {
      buttonStyle["fontSize"] = this.state.fontSize + "px";
    }

    return (
        <span className="button-label"
              style={buttonStyle}>{this.props.children}</span>
    );
  }
}
