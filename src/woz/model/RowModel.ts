export interface IRowModel {
  readonly id: string
  readonly label: string
  readonly buttons?: string[]
}

export class RowModel implements IRowModel {
  public readonly id: string
  public readonly label: string
  public readonly buttons: string[]

  constructor(model: IRowModel) {
    this.id = model.id
    this.label = model.label
    this.buttons = model.buttons === undefined ? [] : model.buttons
  }
}
