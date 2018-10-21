export class RowModel {
  public id: string;
  public label: string;
  public buttons: string[];

  constructor(id: string, label: string, buttons: string[]) {
    this.id = id.trim();
    this.label = label.trim();
    this.buttons = buttons.map((s) => s.trim());
  }
}
