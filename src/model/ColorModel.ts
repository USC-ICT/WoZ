function hex(x) {
  const h = "000000" + Number(x).toString(16);
  return h.substr(h.length - 2, 2);
}

export class ColorModel {
  public r: number;
  public g: number;
  public b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public asCSS = (): string => {
    return "#" + hex(this.r) + hex(this.g) + hex(this.b);
  }
}
