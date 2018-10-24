import {valueOrDefault} from "../util";

interface IStoredSpreadsheet {
  title: string;
}

export class Store {
  public static shared = new Store();

  private readonly store = new Proxy(localStorage, {
    get: (target, property): any => {
      if (typeof property !== "string") {
        return undefined;
      }
      const value = target.getItem(property);
      if (value === undefined || value === null) {
        return undefined;
      }
      return JSON.parse(value);
    },

    set: (target, property, newValue): boolean => {
      if (typeof property !== "string") {
        return false;
      }
      target.setItem(property, JSON.stringify(newValue));
      return true;
    },
  });

  get selectedSpreadsheetID(): string {
    // noinspection SpellCheckingInspection
    return valueOrDefault(this.store.selectedSpreadsheetID,
        () => "1zaCUTsvAsGJv-XcG1bXeKzKPsjsh7u2NbhmZV24uM8I");
  }

  set selectedSpreadsheetID(newValue: string) {
    this.store.selectedSpreadsheetID = newValue;
  }

  get knownSpreadsheets(): {[s: string]: IStoredSpreadsheet} {
    // noinspection SpellCheckingInspection
    return valueOrDefault(
        this.store.knownSpreadsheets,
        (): {[s: string]: IStoredSpreadsheet} => ({}));
  }

  set knownSpreadsheets(newValue: {[s: string]: IStoredSpreadsheet}) {
    this.store.knownSpreadsheets = newValue;
  }
}
