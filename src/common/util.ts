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
export const arrayMap = <T, U>(
    o: ArrayLike<T>,
    f: (value: T, index: number) => U)
    : U[] => {
  const result: U[] = [];
  for (let i = 0; i < o.length; ++i) {
    result.push(f(o[i], i));
  }
  return result;
};

// noinspection JSUnusedGlobalSymbols
export const arrayCompactMap = <T, U>(
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

// noinspection JSUnusedGlobalSymbols
export const objectMap = <T, U>(
    o: { [s: string]: T },
    f: (value: [string, T]) => U)
    : U[] => {
  return Object.entries(o).map(f);
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
export const objectMapValues = <T, U>(
    o: { [s: string]: T },
    f: (value: T) => U): { [s: string]: U } => {
  return Object.assign({}, ...Object.keys(o)
      .map((k: string) => ({[k]: f(o[k])})));
};

// noinspection JSUnusedGlobalSymbols
export const objectFromArray = <T>(
    array: Array<[string, T]>): {[s: string]: T} => {
  const result: {[s: string]: T} = {};
  for (const pair of array) {
    result[pair[0]] = pair[1];
  }
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

// noinspection JSUnusedGlobalSymbols
export const safe = <T>(f: () => T): T | undefined => {
  try {
    return f();
  } catch {
    return undefined;
  }
};

// // noinspection JSUnusedGlobalSymbols
// export const valueOrDefault = <T>(v: T | undefined, defValue: () => T): T => {
//   return v === undefined ? defValue() : v;
// };
//
// export const safe = <T>(f: () => T, error: string): T => {
//   try {
//     return f();
//   } catch {
//     throw new Error(error);
//   }
// };

export interface IHTTPRequest<T> {
  readonly method: "GET" | "POST";
  url: string;
  content?: T;
  headers: {[s: string]: string};
}

// Using callbacks:
const _request = <Request, Response>(
    params: IHTTPRequest<Request>,
    callback: (response: Response) => void = (() => { /* empty */ }),
    errorCallback: (err: any) => void = (() => { /* empty */ })) => {

  const httpRequest = new XMLHttpRequest();
  httpRequest.open(params.method, params.url, true);
  httpRequest.onload = () => {
    if (httpRequest.status >= 200 && httpRequest.status < 400) {
      // Success!
      const response = JSON.parse(httpRequest.response) as Response;
      callback(response);
    } else {
      // We reached our target server, but it returned an error
    }
  };

  httpRequest.onerror = (err) => {
    // There was a connection error of some sort
    errorCallback(err);
  };

  Object.entries(params.headers).forEach((value: [string, string]) => {
    httpRequest.setRequestHeader(value[0], value[1]);
  });

  if (params.method === "POST") {
    httpRequest.setRequestHeader(
        "Content-Type",
        "application/json; charset=UTF-8");
  }

  if (params.content !== undefined) {
    httpRequest.send(JSON.stringify(params.content));
  }
};

// Using promises:
export const request = <Request, Response>(
    params: IHTTPRequest<Request>): Promise<Response> => {
  return new Promise<Response>((resolve, reject) => {
    _request(params, resolve, reject);
  });
};

// noinspection JSUnusedGlobalSymbols
export const styles = (...values: string[]): string => {
  return values.join(" ");
};