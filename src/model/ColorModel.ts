// import {log} from "../controller/Logger";

function hex(x: number): string {
  const h = "000000" + Number(Math.floor(x * 255)).toString(16);
  return h.substr(h.length - 2, 2);
}

function clip(x: number | undefined): number {
  if (x === undefined) { return 0; }
  return Math.max(0, Math.min(1, x));
}
export class ColorModel {

  public get isWhite(): boolean {
    return this.blue === 1 && this.red === 1 && this.green === 1;
  }

  public get css(): string {
    return "#" + hex(this.red) + hex(this.green) + hex(this.blue);
  }

  public readonly red: number;
  public readonly green: number;
  public readonly blue: number;

  constructor(color: {
    red?: number,
    green?: number,
    blue?: number,
  }) {
    this.red = clip(color.red);
    this.green = clip(color.green);
    this.blue = clip(color.blue);
  }
}
