export class ScreenModel {
  public id: string;
  public label: string;
  public rows: string[];

  constructor(id: string, label: string, rows: string[]) {
    this.id = id.trim();
    this.label = label.trim();
    this.rows = rows.map((s) => s.trim());
  }
}
