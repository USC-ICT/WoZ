export interface IButtonModel {
  readonly id: string;
  readonly tooltip: string;
  readonly label: string;
  readonly transitions: { [index: string]: string };
  readonly badges: { [index: string]: string };
  readonly color?: string;
  readonly imageURL?: string;
}

export class ButtonModel implements IButtonModel {
  public readonly id: string;
  public readonly tooltip: string;
  public readonly label: string;
  public fontSize?: number;
  public readonly transitions: { [index: string]: string };
  public readonly badges: { [index: string]: string };
  public readonly color?: string;
  public readonly imageURL?: string;

  constructor(model: IButtonModel) {
    this.id = model.id;
    this.tooltip = model.tooltip;
    this.fontSize = undefined;
    this.label = model.label;
    this.transitions = model.transitions;
    this.badges = model.badges;
    this.color = model.color;
    this.imageURL = model.imageURL;
  }
}
