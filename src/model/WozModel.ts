import {ButtonModel} from "./ButtonModel";
import {ColorModel} from "./ColorModel";
import {RowModel} from "./RowModel";
import {ScreenModel} from "./ScreenModel";

export interface IWozModel {
  id: string;
  buttons: { [index: string]: ButtonModel };
  colors?: { [index: string]: ColorModel };
  screens: { [index: string]: ScreenModel };
  rows: { [index: string]: RowModel };
}

export class WozModel implements IWozModel {
  public readonly id: string;
  public readonly colors: { [index: string]: ColorModel };
  public readonly buttons: { [index: string]: ButtonModel };
  public readonly screens: { [index: string]: ScreenModel };
  public readonly rows: { [index: string]: RowModel };
  public readonly allScreenIDs: string[];

  constructor(model: IWozModel) {
    this.id = model.id;
    this.buttons = model.buttons;
    this.colors = model.colors || {};
    this.rows = model.rows;
    this.screens = model.screens;
    this.allScreenIDs = Object.keys(this.screens);
  }
}
