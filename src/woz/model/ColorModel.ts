/*
 * Copyright 2018. University of Southern California
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// import {log} from "../controller/Logger";

function hex(x: number): string {
  const h = "000000" + Number(Math.floor(x * 255)).toString(16)
  return h.substr(h.length - 2, 2)
}

function clip(x: number | undefined): number {
  if (x === undefined) {
    return 0
  }
  return Math.max(0, Math.min(1, x))
}

export interface IRGBColor {
  readonly red: number
  readonly green: number
  readonly blue: number
}

export interface IHSLColor {
  readonly hue: number
  readonly saturation: number
  readonly lightness: number
}

const expandRGB = (color: Partial<IRGBColor>): IRGBColor => {
  return {
    blue: clip(color.blue),
    green: clip(color.green),
    red: clip(color.red),
  }
}

const expandHSL = (color: Partial<IHSLColor>): IHSLColor => {
  return {
    hue: clip(color.hue),
    lightness: clip(color.lightness),
    saturation: clip(color.saturation),
  }
}

const hsl2rgb = (color: IHSLColor): IRGBColor => {

  if (color.saturation === 0) {
    return {
      blue: color.lightness,
      green: color.lightness,
      red: color.lightness,
    }
  }

  const hue2rgb = (t: number): number => {
    if (t < 0) {
      t += 1
    }
    if (t > 1) {
      t -= 1
    }
    if (t < 1 / 6) {
      return p + (q - p) * 6 * t
    }
    if (t < 1 / 2) {
      return q
    }
    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6
    }
    return p
  }

  const q = color.lightness < 0.5
      ? color.lightness * (1 + color.saturation)
      : color.lightness + color.saturation - color.lightness * color.saturation
  const p = 2 * color.lightness - q
  const red = hue2rgb(color.hue + 1 / 3)
  const green = hue2rgb(color.hue)
  const blue = hue2rgb(color.hue - 1 / 3)

  return {
    blue,
    green,
    red,
  }
}

export class ColorModel {

  public static fromRGB = (color: Partial<IRGBColor>): ColorModel => {
    return new ColorModel(expandRGB(color))
  }

  public static fromHSL = (color: Partial<IHSLColor>): ColorModel => {
    return new ColorModel(hsl2rgb(expandHSL(color)))
  }

  public get isWhite(): boolean {
    return this.blue === 1 && this.red === 1 && this.green === 1
  }

  public get css(): string {
    return "#" + hex(this.red) + hex(this.green) + hex(this.blue)
  }

  public readonly red!: number
  public readonly green!: number
  public readonly blue!: number

  private constructor(color: IRGBColor) {
    Object.assign(this, color)
  }
}
