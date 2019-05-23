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

// noinspection JSUnusedGlobalSymbols
export const stringEncodingHTML = (s: string): string => {
  return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
}

// noinspection JSUnusedGlobalSymbols
export const arrayMap = <T, U>(
    o: ArrayLike<T>,
    f: (value: T, index: number) => U)
    : U[] => {
  const result: U[] = []
  for (let i = 0; i < o.length; ++i) {
    result.push(f(o[i], i))
  }
  return result
}

// noinspection JSUnusedGlobalSymbols
export const arrayCompactMap = <T, U>(
    o: ArrayLike<T>,
    f: (value: T, index: number) => U | undefined)
    : U[] => {
  const result: U[] = []
  for (let i = 0; i < o.length; ++i) {
    const y = f(o[i], i)
    if (y !== undefined) {
      result.push(y)
    }
  }
  return result
}

// noinspection JSUnusedGlobalSymbols
export const objectMap = <T, U>(
    o: { [s: string]: T },
    f: (value: [string, T]) => U)
    : U[] => {
  return Object.entries(o).map(f)
}

// noinspection JSUnusedGlobalSymbols
export const objectCompactMap = <T, U>(
    o: { [s: string]: T },
    f: (value: [string, T]) => U | undefined)
    : U[] => {
  const result: U[] = []
  Object.entries(o).forEach((x) => {
    const y = f(x)
    if (y !== undefined) {
      result.push(y)
    }
  })
  return result
}

// noinspection JSUnusedGlobalSymbols
export const objectMapValues = <T, U>(
    o: { [s: string]: T },
    f: (value: T, key: string) => U): { [s: string]: U } => {
  return Object.assign({}, ...Object.keys(o)
                                    .map((k: string) => ({[k]: f(o[k], k)})))
}

// noinspection JSUnusedGlobalSymbols
export const objectFromArray = <T>(
    array: Array<[string, T]>): { [s: string]: T } => {
  const result: { [s: string]: T } = {}
  for (const pair of array) {
    result[pair[0]] = pair[1]
  }
  return result
}

// noinspection JSUnusedGlobalSymbols
export const removingPathExtension = (aString: string): string => {
  // noinspection JSValidateTypes
  const parts = aString.split(".")
  return parts.length <= 1 ? aString : parts.slice(0, -1).join(".")
}

// noinspection JSUnusedGlobalSymbols
export const appendingPathExtension = (
    aString: string,
    ext: string): string => {
  return aString + "." + ext
}

// noinspection JSUnusedGlobalSymbols
export const pathExtension = (aString: string): string => {
  // noinspection JSValidateTypes
  const parts = aString.split(".")
  return parts.length <= 1 ? aString : parts[parts.length - 1]
}

// noinspection JSUnusedGlobalSymbols
export const safe = <T>(f: () => T): T | undefined => {
  try {
    return f()
  } catch {
    return undefined
  }
}

// noinspection JSUnusedGlobalSymbols
export const styles = (...values: string[]): string => {
  return values.join(" ")
}

// noinspection JSUnusedGlobalSymbols
export const defaultValue = <T>(value: T | undefined, defValue: T): T => {
  return value !== undefined ? value : defValue
}

// noinspection JSUnusedGlobalSymbols
export const isKeyPressed = (event: KeyboardEvent, key: string) => {
  if (event.defaultPrevented) {
    return false // Should do nothing if the default action has been cancelled
  }

  let handled = false
  if (event.key !== undefined && event.key === key) {
    handled = true
  }

  if (handled) {
    // Suppress "double action" if event handled
    event.preventDefault()
  }
  return handled
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
// noinspection JSUnusedGlobalSymbols
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
