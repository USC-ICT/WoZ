import * as React from "react"

export class ConsoleConnectorComponent extends React.Component<{}, {}> {

  constructor(props: any) {
    super(props)
  }

  public render() {
    return (
        <div>
          We will render the button result onto the browser console.
        </div>
    )
  }
}
