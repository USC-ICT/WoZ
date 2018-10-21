import {ButtonModel} from "./ButtonModel";
import {ColorModel} from "./ColorModel";
import {RowModel} from "./RowModel";
import {ScreenModel} from "./ScreenModel";

export class WozModel {
  public id: string;
  public colors: { [index: string]: ColorModel };
  public buttons: { [index: string]: ButtonModel };
  public screens: { [index: string]: ScreenModel };
  public rows: { [index: string]: RowModel };
  public allScreenIDs: string[];
}
