//
//  Label
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as React from "react";
import * as ReactDOM from "react-dom";
// import {log} from "../controller/Logger";
import {ICachedFontSize} from "../model/ButtonModel";
import css from "./button.module.css";

const BUTTON_LABEL_MIN_FONT_SIZE = 5;

interface ILabelState {
  fontSize: number;
  parentWidth: number;
  parentHeight: number;
  ready: boolean;
  smallestUnacceptableFontSize: number;
  largestAcceptableFontSize: number;
}

interface ILabelProperties {
  model: ICachedFontSize;
}

export class Label extends React.Component<ILabelProperties, ILabelState> {

  constructor(props: ILabelProperties) {
    super(props);
    this.state = {
      fontSize: props.model.fontSize === undefined ? 0 : props.model.fontSize,
      largestAcceptableFontSize: BUTTON_LABEL_MIN_FONT_SIZE,
      parentHeight: 0,
      parentWidth: 0,
      ready: props.model.fontSize !== undefined,
      smallestUnacceptableFontSize: 0,
    };
  }

  public componentDidMount() {
    this._computeSizeIfNeeded();
  }

  public componentDidUpdate() {
    this._computeSizeIfNeeded();
  }

  public _thisDOMElement(): Element | null {
    const el = ReactDOM.findDOMNode(this);
    return (el instanceof Element) ? el : null;
  }

  public _computeSizeIfNeeded() {
    if (this.state.ready) {
      return;
    }

    const el = this._thisDOMElement();
    if (el === null) { return; }
    let currentFontSize = this.state.fontSize;

    if (this.state.fontSize === 0) {
      const parent = el.parentElement;
      if (parent === null) { return; }

      // inner dimensions. subtract padding.
      const parentStyle = window.getComputedStyle(parent);
      const newParentWidth = parent.clientWidth
          - parseInt(parentStyle.paddingLeft || "0", 10)
          - parseInt(parentStyle.paddingRight || "0", 10);
      const newParentHeight = parent.clientHeight
          - parseInt(parentStyle.paddingTop || "0", 10)
          - parseInt(parentStyle.paddingBottom || "0", 10);

      // we should only compute the size if the node is visible = its parent is
      // visible
      if (newParentWidth <= 0) {
        return;
      }

      currentFontSize = parseInt(
          window.getComputedStyle(el).fontSize || "12", 10);

      this.setState((prevState) => {
        // log.debug("new font size ", currentFontSize);
        return {
          fontSize: currentFontSize,
          parentHeight: newParentHeight,
          parentWidth: newParentWidth,
          ready: false,
          smallestUnacceptableFontSize: prevState.fontSize,
        };
      });

      return;
    }

    if (currentFontSize <= this.state.largestAcceptableFontSize) {

      this.setState((prevState) => {
        const fontSize = Math.max(
            prevState.fontSize, BUTTON_LABEL_MIN_FONT_SIZE);
        this.props.model.fontSize = fontSize; // cache it
        return {
          fontSize,
          ready: true,
        };
      });

    } else if (el.clientHeight > this.state.parentHeight ||
               el.clientWidth > this.state.parentWidth) {

      this.setState((prevState) => {
        return {
          fontSize: Math.floor((prevState.largestAcceptableFontSize +
                                prevState.fontSize) / 2),
          smallestUnacceptableFontSize: prevState.fontSize,
        };
      });

    } else if (currentFontSize <
               this.state.smallestUnacceptableFontSize - 1) {

      this.setState((prevState) => {
        return {
          fontSize: Math.floor((prevState.fontSize +
                                prevState.smallestUnacceptableFontSize) / 2),
          largestAcceptableFontSize: prevState.fontSize,
        };
      });

    } else {

      this.setState((prevState) => {
        this.props.model.fontSize = prevState.fontSize; // cache it
        return {
          ready: true,
        };
      });

    }

  }

  public render() {

    const buttonStyle = (this.state.fontSize !== 0) ? {
      fontSize: this.state.fontSize + "px",
    } : {};

    return (
        <span className={css.label}
              style={buttonStyle}>{this.props.children}</span>
    );
  }
}
