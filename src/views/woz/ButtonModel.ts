export class ButtonModel {
  public id: string;
  public tooltip: string;
  public label: string;
  public fontSize: number;
  public transitions: { [index: string]: string };
  public badges: { [index: string]: string };
  public color: string;

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
