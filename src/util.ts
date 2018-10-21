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
export const objectMapValues = (o: object, f) =>
    Object.assign({}, ...Object.keys(o).map((k) => ({[k]: f(o[k])})));

// noinspection JSUnusedGlobalSymbols
export const compactMap = (o, f) =>
    o.map(f).filter((x) => {
      return x !== undefined;
    });

// noinspection JSUnusedGlobalSymbols
export const objectMap = (o, f) => Object.entries(o).map(f);

// noinspection JSUnusedGlobalSymbols
export const objectCompactMap = (o: object, f) =>
    objectMap(o, f).filter((x) => {
      return x !== undefined;
    });

// noinspection JSUnusedGlobalSymbols
export const removingFileExtension = (aString: string): string => {
  // noinspection JSValidateTypes
  const parts = aString.split(".");
  return parts.length <= 1 ? aString : parts.slice(0, -1).join(".");
};
