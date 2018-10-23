export interface IScreenModel {
  readonly id: string;
  readonly label: string;
  readonly rows: string[];
}

export class ScreenModel implements IScreenModel {
  public readonly id: string;
  public readonly label: string;
  public readonly rows: string[];

  constructor(model: IScreenModel) {
    this.id = model.id;
    this.label = model.label;
    this.rows = model.rows;
  }
}
