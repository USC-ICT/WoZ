export interface ICachedFontSize {
  fontSize?: number
}

export interface IButtonModel {
  id: string
  tooltip: string
  label: string
  transitions: { [index: string]: string }
  badges: { [index: string]: string }
  color?: string
  imageURL?: string
  [index: string]: any
}

export class ButtonModel implements IButtonModel, ICachedFontSize {
  public readonly id!: string
  public readonly tooltip!: string
  public readonly label!: string
  public fontSize?: number
  public readonly transitions!: { [index: string]: string }
  public readonly badges!: { [index: string]: string }
  // public readonly color?: string;
  // public readonly imageURL?: string;
  readonly [index: string]: any;

  constructor(model: IButtonModel) {
    Object.assign(this, model)
    this.fontSize = undefined
  }
}
