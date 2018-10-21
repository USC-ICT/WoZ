import * as React from "react";

export class ButtonModel {
  id: string;
  tooltip: string;
  label: string;
  fontSize: number;
  transitions: {[index: string]: string};
  badges: {[index: string]: string};
  color: string;

  constructor() {
    this.id = undefined;
    this.tooltip = "";
    this.fontSize = undefined;
    this.label = "";
    this.transitions = {};
    this.badges = {};
    this.color = undefined;
  }
}

export class RowModel {
  id: string;
  label: string;
  buttons: Array<string>;

  constructor(id: string, label: string, buttons: Array<string>) {
    this.id = id.trim();
    this.label = label.trim();
    this.buttons = buttons.map(s => s.trim());
  }
}

export interface ScreenModel {
  id: string;
  label: string;
  rows: Array<string>;
}

export interface ColorModel {
  r: number;
  g: number;
  b: number;
}

export interface WozModel {
  id: string;
  colors: {[index: string] : ColorModel};
  buttons: {[index: string] : ButtonModel};
  screens: {[index: string] : ScreenModel};
  rows: {[index: string] : RowModel};
  allScreenIDs: Array<string>;
}

export interface ButtonProperties {
  data: WozModel;
  identifier: string;
  onclick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export interface WozCollectionModel {
  [index: string]: WozModel;
}