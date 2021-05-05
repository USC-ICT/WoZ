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


import * as React from "react"
import {Input, InputProps} from "semantic-ui-react"
import {Coalescer} from "../../common/Coalescer"
import {defaultValue, isKeyPressed} from "../../common/util"

export interface ISearchProperties extends InputProps {
  onSearch: (newValue: string) => void
  placeholder?: string
  initialValue?: string
  delay?: number
}

interface ISearchState {
  value: string
}

export class Search extends React.Component<ISearchProperties, ISearchState> {

  private readonly coalescer = new Coalescer()

  private _setFilter = (text: string, delay: number) => {
    const value = text.trim()

    this.setState({value})

    this.coalescer.append(() => {
      this.props.onSearch(value)
    }, value === "" ? 0 : delay)
  }

  protected static defaultProps = {
    delay: 500,
    initialValue: "",
  }

  constructor(props: ISearchProperties) {
    super(props)
    this.state = {
      value: defaultValue(this.props.initialValue,
          Search.defaultProps.initialValue),
    }
  }

  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  public render(): React.ReactNode {

    // noinspection JSUnusedGlobalSymbols
    const cancelIcon: any = this.state.value !== ""
                       ?
        {
          circular: true,
          link: true,
          name: "cancel",
          onClick: () => {this._setFilter("", 0)},
        }
                       : this.props.icon

    /* eslint-disable @typescript-eslint/no-unused-vars */
    // noinspection JSUnusedLocalSymbols
    const {delay, icon, initialValue, onSearch, onChange, ...other} = this.props
    /* eslint-enable @typescript-eslint/no-unused-vars */
    const timerDelay = defaultValue(this.props.delay,
        Search.defaultProps.delay)
    return (
        <Input
            {...other}
            icon={cancelIcon}
            // label={{icon: "filter"}}
            // labelPosition="left"
            // placeholder={defaultValue(this.props.placeholder, "Filter...")}
            value={this.state.value}
            onChange={(_event1, data) => {
              this._setFilter(data.value.trim(), timerDelay)
            }}
            onKeyDown={(event: KeyboardEvent) => {
              if (isKeyPressed(event, "Enter")) {
                this._setFilter(this.state.value, 0)
              } else if (isKeyPressed(event, "Escape")) {
                this._setFilter("", 0)
              }
            }}
        />
    )
  }
}
