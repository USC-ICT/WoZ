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

import {arrayMap} from "../../common/util"
import {ButtonModel} from "./ButtonModel"
import {ColorModel} from "./ColorModel"
import {RowModel} from "./RowModel"
import {IScreenModel, ScreenModel} from "./ScreenModel"

export interface IWozContent {
  readonly buttons: { [index: string]: ButtonModel }
  readonly screens: { [index: string]: ScreenModel }
  readonly rows: { [index: string]: RowModel }
}

export interface IWozArguments {
  readonly id: string
  readonly colors: { [index: string]: ColorModel }
}

export interface IWozParameters extends IWozArguments {
  readonly contentLoader: () => Promise<IWozContent>
}

export interface IWozContext extends IWozArguments, IWozContent {

}

export class WozModel implements IWozContext {
  private _data?: IWozContent

  private _promise?: Promise<IWozContent>

  private readonly _loader: () => Promise<IWozContent>

  constructor(model: IWozParameters) {
    this.id = model.id
    this.colors = model.colors
    this._loader = model.contentLoader
    // this.allScreenIDs = Object.keys(this.screens);
  }

  public readonly id: string

  public readonly colors: { [index: string]: ColorModel }

  public loadContent = (): Promise<IWozContent> => {
    if (this._promise !== undefined) {
      return this._promise
    }
    this._promise = this._loader()
                        .then((result) => {
                              this._data = result
                              return result
                            })
                        .catch((error) => {
                          throw error
                        })
    return this._promise
  }

  public get buttons(): { [index: string]: ButtonModel } {
    return this._data === undefined ? {} : this._data.buttons
  }

  public get screens(): { [index: string]: ScreenModel } {
    return this._data === undefined ? {} : this._data.screens
  }

  public get rows(): { [index: string]: RowModel } {
    return this._data === undefined ? {} : this._data.rows
  }
}

// noinspection JSUnusedGlobalSymbols
export const generateScreenTabs = (model: IWozContent): IWozContent => {

  const colorTab = "color.tab"
  const colorTabSelected = "color.tab.selected"

  const plainButtonID = (screen: IScreenModel): string => {
    return "_trans." + screen.id + ".plain"
  }

  const selectedButtonID = (screen: IScreenModel): string => {
    return "_trans." + screen.id + ".selected"
  }

  Object.entries(model.screens).forEach((value) => {
    const screen = value[1]

    const addButton = (id: string, color: string) => {
      model.buttons[id] = {
        badges: {},
        color,
        id,
        label: screen.label,
        tooltip: "Go to \"" + screen.label + "\"",
        transitions: {_any: screen.id},
      }
    }

    addButton(plainButtonID(screen), colorTab)
    addButton(selectedButtonID(screen), colorTabSelected)

    const rowID = "_tab." + screen.id

    model.rows[rowID] = {
      buttons: arrayMap(Object.entries(model.screens), (otherValue) => {
        const otherScreen = otherValue[1]
        return otherScreen.id === screen.id
               ? selectedButtonID(otherScreen)
               : plainButtonID(otherScreen)
      }),
      id: rowID,
      label: "Screens",
    }

    screen.rows.unshift(rowID)
  })

  return model
}
