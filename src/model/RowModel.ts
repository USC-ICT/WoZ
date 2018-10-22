export class RowModel {
  public readonly id: string;
  public readonly label: string;
  public readonly buttons: string[];

  constructor(id: string, label: string, buttons: string[]) {
    this.id = id.trim();
    this.label = label.trim();
    this.buttons = buttons.map((s) => s.trim());
  }
}
