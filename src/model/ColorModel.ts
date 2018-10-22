import {log} from "../controller/Logger";

function hex(x) {
  const h = "000000" + Number(Math.floor(x * 255)).toString(16);
  return h.substr(h.length - 2, 2);
}

export class ColorModel {

  public get isWhite(): boolean {
    return this.blue === 1 && this.red === 1 && this.green === 1;
  }

  public get css(): string {
    return "#" + hex(this.red) + hex(this.green) + hex(this.blue);
  }

  public red: number;
  public green: number;
  public blue: number;

  constructor(color: {
    red?: number,
    green?: number,
    blue?: number,
  }) {
    this.red = color.red || 0;
    this.green = color.green || 0;
    this.blue = color.blue || 0;
  }
}
