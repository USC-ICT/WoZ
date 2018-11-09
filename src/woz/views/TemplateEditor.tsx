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
import {Button, Input, Modal} from "semantic-ui-react"

interface ITemplateEditorProperties {
  onCancel: () => void
  onConfirm: (newValue: string) => void
  text: string
}

interface ITemplateEditorState {
  readonly parts: string[]
  result: string[]
}

export class TemplateEditor
    extends React.Component<ITemplateEditorProperties, ITemplateEditorState> {

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
    this.props.onConfirm(this.state.result.join(""))
  }

  constructor(props: any) {
    super(props)
    const parts = this.props.text.split(/##input##/)
    this.state = {
      parts,
      result: [parts[0]]
          .concat(
              parts.slice(1).reduce((previousValue: any[], currentValue) => {
                return previousValue.concat(["", currentValue])
              }, [])),
    }
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
    const components = [this.state.parts[0]]
        .concat(this.state.parts.slice(1)
                    .reduce((previousValue: any[], currentValue, index) => {
                      return previousValue.concat([
                        <Input
                            key={index}
                            onChange={(_e, data) => this.setState((prev) => {
                              prev.result[index * 2 + 1] = data.value
                              return {result: prev.result}
                            })}/>,
                        currentValue,
                      ])
                    }, []))

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
