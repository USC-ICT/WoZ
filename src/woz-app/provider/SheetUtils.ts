import {
  appendingPathExtension, arrayCompactMap,
  arrayMap,
  objectFromArray,
  pathExtension,
  removingPathExtension,
} from "../../common/util";
import {ButtonModel, IButtonModel} from "../../woz/model/ButtonModel";
import {ColorModel} from "../../woz/model/ColorModel";
import {RowModel} from "../../woz/model/RowModel";
import {ScreenModel} from "../../woz/model/ScreenModel";
import {generateScreenTabs, IWozContent} from "../../woz/model/WozModel";
import {Store} from "../Store";

const BUTTON_EXT: string = "buttons";
const ROW_EXT: string = "rows";
const SCREENS_EXT: string = "screens";

export interface IWozSheets {
  readonly buttons: string;
  readonly name: string;
  readonly rows: string;
  readonly screens?: string;
}

export enum SpreadsheetDimension {
  ROW = "ROW",
  COLUMN = "COLUMN",
}

export type SpreadsheetValuesCallback =
    (sheetName: string, dimension: SpreadsheetDimension) => Promise<any[][]>;

export const sheetsFromNameArray = (names: string[], title: string): IWozSheets[] => {
  let result: IWozSheets[] = [];
  const namesAsSet = new Set(names);
  names.forEach((name: string) => {
    if (name === BUTTON_EXT) {
      if (!namesAsSet.has(ROW_EXT)) {
        return;
      }
      result = result.concat([{
        buttons: name,
        name: title,
        rows: ROW_EXT,
        screens: namesAsSet.has(SCREENS_EXT) ? SCREENS_EXT : undefined,
      }]);
      return;
    }
    if (!name.endsWith("." + BUTTON_EXT)) {
      return;
    }
    const baseName = removingPathExtension(name);
    if (!namesAsSet.has(appendingPathExtension(baseName, ROW_EXT))) {
      return;
    }
    result = result.concat([{
      buttons: name,
      name: baseName,
      rows: appendingPathExtension(baseName, ROW_EXT),
      screens: namesAsSet.has(appendingPathExtension(baseName, SCREENS_EXT))
          ? appendingPathExtension(baseName, SCREENS_EXT) : undefined,
    }]);
  });
  return result;
};

const extractKeys = (buttonRowValues: any[]): string[] => {
  return arrayMap(buttonRowValues[0], (v: string): string => {
    v = v.trim();
    if (v.toLocaleLowerCase() === "answer") {
      // legacy exception
      return "tooltip";
    }
    if (!v.startsWith("woz.")) {
      return "";
    }
    v = v.split(".").splice(1).join(".").trim();
    return v.trim();
  });
};

const parseButtonSheetRow = (keys: string[]) => {
  // object from a button sheet row with properties based on the
  // first button sheet row values

  return (values: any[]): [string, ButtonModel] | undefined => {
    const result: IButtonModel = {
      badges: {},
      id: "",
      label: "",
      tooltip: "",
      transitions: {},
    };
    values.forEach((value, index) => {
      const key = keys[index];
      if (key === undefined || value === undefined || key.length === 0) {
        return;
      }
      value = value.toString().trim();
      if (key === "transitions" || key === "transition") {
        if (value !== "") {
          result.transitions._any = value;
        }
        return;
      }
      if (key.startsWith("badge.")) {
        result.badges[pathExtension(key)] = value;
        return;
      }
      result[key] = value;
    });

    if (result.id === "") {
      return undefined;
    }
    const button = new ButtonModel(result);
    return [button.id, button];
  };
};

const _trim = (s?: string): string => {
  return s === undefined ? "" : s.trim();
};

// the row and column arrays can be sparse!

const parseRowSheetRow = (values?: any[]): [string, RowModel] | undefined => {
  if (values === undefined || values.length < 2 || values[0] === undefined || values[1] === undefined) {
    return undefined;
  }
  const model = new RowModel({
    buttons: arrayMap(values.slice(2), _trim),
    id: _trim(values[0]),
    label: _trim(values[1]),
  });
  return [model.id, model];
};

const parseScreenSheetColumn = (values?: any[]): [string, ScreenModel] | undefined => {
  if (values === undefined || values.length < 2 || values[0] === undefined || values[1] === undefined) {
    return undefined;
  }
  const model = new ScreenModel({
    id: _trim(values[0]),
    label: _trim(values[1]),
    rows: arrayMap(values.slice(2), _trim),
  });
  return [model.id, model];
};

export const loadWozData = async (values: SpreadsheetValuesCallback, sheets: IWozSheets): Promise<IWozContent> => {
  const buttonRowValues = await values(sheets.buttons, SpreadsheetDimension.ROW);

  const keys = extractKeys(buttonRowValues);

  const idIndex = keys.findIndex((x) => x === "id");
  if (idIndex === undefined) {
    throw new Error("no_id_attribute_in_button_sheet");
  }

  const buttons = objectFromArray(
      arrayCompactMap(buttonRowValues.slice(1), parseButtonSheetRow(keys)));

  const rowRowValues = await values(sheets.rows, SpreadsheetDimension.ROW);

  const sheetColumnsValues = sheets.screens === undefined
      ? undefined : await values(sheets.screens, SpreadsheetDimension.COLUMN);

  const rows = objectFromArray(arrayCompactMap(rowRowValues, parseRowSheetRow));

  const screens =
      sheetColumnsValues === undefined
          ? {
            [sheets.name]: new ScreenModel({
              id: sheets.name,
              label: sheets.name,
              rows: Object.keys(rows),
            }),
          }
          : objectFromArray(arrayCompactMap(
          sheetColumnsValues, parseScreenSheetColumn));

  let result = {
    buttons,
    rows,
    screens,
  };

  if (Store.shared.generateScreenNavigation) {
    result = generateScreenTabs(result);
  }

  return result;
};

export const parseIndexedColors = (rows: any[][]): { [s: string]: ColorModel } | undefined => {
  const keys = objectFromArray(arrayMap(rows[0] ? rows[0] : [],
      (value: any, index: number): [string, number] => {
        return [value === undefined ? "" : value.toString().trim().toLocaleLowerCase(), index];
      }));

  if (keys.id !== undefined
      && keys.hue !== undefined
      && keys.saturation !== undefined
      && keys.brightness !== undefined) {

    const _asNumber = (x: any): number | undefined => {
      if (x === undefined || x === null) { return undefined; }
      if (typeof x === "number") { return x; }
      const y = Number(x);
      return isNaN(y) ? undefined : y;
    };

    return objectFromArray(arrayCompactMap(rows.slice(1),
        (row: any): [string, ColorModel] | undefined => {
          // for each row
          if (row === undefined) {
            return undefined;
          }

          const id = row[keys.id];
          const hue = _asNumber(row[keys.hue]);
          const saturation = _asNumber(row[keys.saturation]);
          const lightness = _asNumber(row[keys.brightness]);

          if (id === undefined) { return undefined; }

          return [id, ColorModel.fromHSL({
            hue,
            lightness,
            saturation,
          })];
        }));
  }

  return undefined;
};
