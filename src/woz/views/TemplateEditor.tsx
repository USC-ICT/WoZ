/* tslint:disable:interface-over-type-literal */
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
import {Button, Dropdown, Input, Modal} from "semantic-ui-react"
import {objectMapValues} from "../../common/util"

type StringMap = { [s: string]: string }

interface ITemplateEditorProperties {
  onCancel: () => void
  onConfirm: (newValue: StringMap) => void
  text: string
}

interface ITemplateEditorState {
  readonly parts: string[]
  variables: StringMap
}

interface IKeyTextValue {
  key: string
  text: string
  value: string
}

interface IVariable {
  key: string
  text?: string
  options: IKeyTextValue[]
}

const parseOptions = (opts: string): IVariable => {
  const parts = opts.split(/;/)
  const values = parts[0].split(/:/)
  const options = parts.slice(1).map((value) => {
    const values1 = value.split(/:/)
    return {
      key: values1[0],
      text: values1.length > 1 ? values1[1] : values1[0],
      value: values1[0],
    }
  })
  return {
    key: values[0],
    options,
    text: values.length > 1 ? values[1] : undefined,
  }
}

export class TemplateEditor
    extends React.Component<ITemplateEditorProperties, ITemplateEditorState> {

  constructor(props: any) {
    super(props)
    const parts = this.props.text.split(/##/)
    const variables: StringMap = {}
    parts.forEach((value, index) => {
      if (index % 2 === 0) { return }
      const theVar = parseOptions(value)
      variables[theVar.key] = theVar.options.length === 0
                              ? "" : theVar.options[0].value
    })
    this.state = {
      parts,
      variables,
    }
  }

  private handleEnter = (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return // Should do nothing if the default action has been cancelled
    }

    let handled = false
    if (event.key !== undefined && event.key === "Enter") {
      handled = true
      this.handleConfirm()
    } else { // noinspection JSDeprecatedSymbols
      if (event.keyCode !== undefined && event.keyCode === 13) {
        handled = true
        this.handleConfirm()
      }
    }

    if (handled) {
      // Suppress "double action" if event handled
      event.preventDefault()
    }
  }

  private handleConfirm = () => {
    this.props.onConfirm(this.state.variables)
  }

  private _assignVariable = (
      variables: StringMap,
      key: string,
      value: string) => {
    return objectMapValues(variables, (_value, _key) => {
      return _key === key ? value : _value
    })
  }

  private _assignVariables = (
      key: string,
      value: string) => {
    this.setState((prev) => {
      return {
        variables: this._assignVariable(prev.variables, key, value),
      }
    })
  }

  // noinspection JSUnusedGlobalSymbols
  public componentDidMount = () => {
    document.addEventListener("keydown", this.handleEnter, false)
  }

  // noinspection JSUnusedGlobalSymbols
  public componentWillUnmount = () => {
    document.removeEventListener("keydown", this.handleEnter, false)
  }

  public render() {
    const components = this.state.parts.map((value, index) => {
      if (index % 2 === 0) { return value }
      const theVar = parseOptions(value)
      if (theVar.options.length === 0) {
        return <Input
            key={index}
            onChange={(_e, data) =>
                this._assignVariables(theVar.key, data.value)}
        />
      }

      return <Dropdown
          key={index}
          inline
          search
          options={theVar.options}
          value={this.state.variables[theVar.key]}
          onChange={(_e, data) => this._assignVariables(
              theVar.key, "" + data.value)}
      />
    })

    return (
        <Modal
            dimmer={"blurring"}
            closeOnEscape={true}
            closeOnDimmerClick={true}
            onClose={this.props.onCancel}
            open={true}>
          <Modal.Header>Fill out the form.</Modal.Header>
          <Modal.Content>
            {components}
          </Modal.Content>
          <Modal.Actions>
            <Button secondary content="Cancel" onClick={this.props.onCancel}/>
            <Button
                primary
                content="Send"
                onClick={this.handleConfirm}
            />
          </Modal.Actions>
        </Modal>
    )
  }
}
