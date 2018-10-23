//
//  util
//  UIProject
//
//  Created by Anton Leuski on 10/12/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

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
    o: { [s: string]: T },
    f: (value: T) => U): { [s: string]: U } => {
  return Object.assign({}, ...Object.keys(o)
      .map((k: string) => ({[k]: f(o[k])})));
};

// noinspection JSUnusedGlobalSymbols
export const compactMap = <T, U>(
    o: ArrayLike<T>,
    f: (value: T, index: number) => U | undefined)
    : U[] => {
  const result: U[] = [];
  for (let i = 0; i < o.length; ++i) {
    const y = f(o[i], i);
    if (y !== undefined) { result.push(y); }
  }
  return result;
};

// export const compactMap = <T, U>(
//     o: { [s: string]: T } | ArrayLike<T>,
//     f: (value: [string, T], index: number, array: Array<[string, T]>) => U | undefined)
//     : U[] => {
//   const result: U[] = [];
//   for (const x of Object.values(o)) {
//     const y = f(x);
//
//   }
//   const mapped: Array<U | undefined> = o.map(f);
//
//   o.map(f).filter((x) => {
//     return x !== undefined;
//   });
//
// }

// noinspection JSUnusedGlobalSymbols
export const objectMap = <T, U>(
    o: { [s: string]: T },
    f: (value: [string, T]) => U,
    thisArg?: any)
    : U[] => {
  return Object.entries(o).map(f, thisArg);
};

// noinspection JSUnusedGlobalSymbols
export const objectCompactMap = <T, U>(
    o: { [s: string]: T },
    f: (value: [string, T]) => U | undefined)
    : U[] => {
  const result: U[] = [];
  Object.entries(o).forEach((x) => {
    const y = f(x);
    if (y !== undefined) { result.push(y); }
  });
  return result;
};

// noinspection JSUnusedGlobalSymbols
export const removingPathExtension = (aString: string): string => {
  // noinspection JSValidateTypes
  const parts = aString.split(".");
  return parts.length <= 1 ? aString : parts.slice(0, -1).join(".");
};

// noinspection JSUnusedGlobalSymbols
export const pathExtension = (aString: string): string => {
  // noinspection JSValidateTypes
  const parts = aString.split(".");
  return parts.length <= 1 ? aString : parts[parts.length - 1];
};
