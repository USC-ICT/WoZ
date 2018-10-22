export class ScreenModel {
  public readonly id: string;
  public readonly label: string;
  public readonly rows: string[];

  constructor(id: string, label: string, rows: string[]) {
    this.id = id.trim();
    this.label = label.trim();
    this.rows = rows.map((s) => s.trim());
  }
}
