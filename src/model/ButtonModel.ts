export class ButtonModel {
  public readonly id: string;
  public readonly tooltip: string;
  public readonly label: string;
  public fontSize?: number;
  public readonly transitions: { [index: string]: string };
  public readonly badges: { [index: string]: string };
  public readonly color?: string;

  constructor(id: string) {
    this.id = id;
    this.tooltip = "";
    this.fontSize = undefined;
    this.label = "";
    this.transitions = {};
    this.badges = {};
    this.color = undefined;
  }
}
