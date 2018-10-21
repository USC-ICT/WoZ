import * as React from "react";

export interface ButtonModel {
  id: string;
  tooltip: string;
  label: string;
  fontSize: number;
  transitions: {[index: string]: string};
}

export interface RowModel {

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