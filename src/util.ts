//
//  util
//  UIProject
//
//  Created by Anton Leuski on 10/12/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

export function defined(x: any): boolean {
  return typeof x !== "undefined" && x !== null;
}

// noinspection JSUnusedGlobalSymbols
export const stringEncodingHTML = (s: string): string => {
  return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
};

// noinspection JSUnusedGlobalSymbols
export const objectMapValues = <T, U>(
    o: { [s: string]: T } | ArrayLike<T>,
    f: (value: T) => U): { [s: string]: U } => {
  return Object.assign({}, ...Object.keys(o)
      .map((k) => ({[k]: f(o[k])})));
};

// noinspection JSUnusedGlobalSymbols
export const compactMap = (o, f) =>
    o.map(f).filter((x) => {
      return x !== undefined;
    });

// noinspection JSUnusedGlobalSymbols
export const objectMap = <T, U>(
    o: { [s: string]: T } | ArrayLike<T>,
    f: (value: [string, T], index: number, array: Array<[string, T]>) => U,
    thisArg?: any)
    : U[] => {
  return Object.entries(o).map(f, thisArg);
};

// noinspection JSUnusedGlobalSymbols
export const objectCompactMap = <T, U>(
    o: { [s: string]: T } | ArrayLike<T>,
    f: (value: [string, T], index: number, array: Array<[string, T]>) => U | undefined)
    : U[] => {
  return objectMap(o, f).filter((x) => {
    return x !== undefined;
  });
};

// noinspection JSUnusedGlobalSymbols
export const removingFileExtension = (aString: string): string => {
  // noinspection JSValidateTypes
  const parts = aString.split(".");
  return parts.length <= 1 ? aString : parts.slice(0, -1).join(".");
};
