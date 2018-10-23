import {ButtonModel} from "./ButtonModel";
import {ColorModel} from "./ColorModel";
import {RowModel} from "./RowModel";
import {ScreenModel} from "./ScreenModel";

export interface IWozContent {
  readonly buttons: { [index: string]: ButtonModel };
  readonly screens: { [index: string]: ScreenModel };
  readonly rows: { [index: string]: RowModel };
}

export interface IWozArguments {
  readonly id: string;
  readonly colors: { [index: string]: ColorModel };
}

export interface IWozParameters extends IWozArguments {
  readonly contentLoader: () => Promise<IWozContent>;
}

export interface IWozContext extends IWozArguments, IWozContent {

}

export class WozModel implements IWozContext {
  public readonly id: string;
  public readonly colors: { [index: string]: ColorModel };

  private _data?: IWozContent;
  private _promise?: Promise<IWozContent>;
  private readonly _loader: () => Promise<IWozContent>;

  public get buttons(): { [index: string]: ButtonModel } {
    return this._data === undefined ? {} : this._data.buttons;
  }
  public get screens(): { [index: string]: ScreenModel } {
    return this._data === undefined ? {} : this._data.screens;
  }
  public get rows(): { [index: string]: RowModel } {
    return this._data === undefined ? {} : this._data.rows;
  }

  constructor(model: IWozParameters) {
    this.id = model.id;
    this.colors = model.colors;
    this._loader = model.contentLoader;
    // this.allScreenIDs = Object.keys(this.screens);
  }

  public loadContent = (): Promise<IWozContent> => {
    if (this._promise !== undefined) { return this._promise; }
    this._promise = this._loader().then(
        (result) => {
          this._data = result;
          return result;
        }, (error) => {
          throw error;
        });
    return this._promise;
  }
}
