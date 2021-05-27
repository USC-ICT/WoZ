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

import {SyntheticEvent} from "react"
import * as React from "react"
import {Dropdown, DropdownProps} from "semantic-ui-react"
import {arrayMap} from "../../common/util"
import {WozModel} from "../model/WozModel"
import css from "./woz.module.css"

export interface IWozSelectorProperties {
  onChange: (newValue: WozModel) => void
  value: WozModel
  values: { [s: string]: WozModel }
}

export const WozSelector
    : React.FunctionComponent<IWozSelectorProperties>
    = (props: IWozSelectorProperties) => {

  const allWozs = Object.values(props.values)
  allWozs.sort((a: WozModel, b: WozModel) => a.id.localeCompare(b.id))
  const options = arrayMap(allWozs, (woz) => {
    return {
      key: woz.id, text: woz.id, value: woz.id,
    }
  })

  return (
      <Dropdown
          placeholder="Select WoZ"
          className={css.wozSelectorDropdown}
          search selection
          allowAdditions={false}
          options={options}
          onChange={(
              _event: SyntheticEvent<HTMLElement>,
              data: DropdownProps) => {
            if (typeof data.value !== "string") { return }
            if (data.value === props.value.id) { return }
            const selection = props.values[data.value]
            // noinspection JSIncompatibleTypesComparison
            if (selection === undefined) { return }
            props.onChange(selection)
          }}
          value={props.value.id}/>
  )
}
