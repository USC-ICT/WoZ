import * as React from "react"
import {Form, Input, Segment} from "semantic-ui-react"
import css from "../../App.module.css"
import {Store} from "../../Store"
import {FirebaseConnector, IFirebaseConnectorModel} from "./FirebaseConnector"

export interface IFirebaseConnectorComponentProperties {
  connector: FirebaseConnector
}

export class FirebaseConnectorComponent
    extends React.Component<IFirebaseConnectorComponentProperties, {}> {

  constructor(props: any) {
    super(props)
  }

  public render() {

    const changeModel = (value: Partial<IFirebaseConnectorModel>) => {
      this.setState((_prev, props) => {
        const newValue = {
          ...props.connector.model,
          ...value,
        }
        Store.shared.firebase = newValue
        this.props.connector.model = newValue
        return {}
      })
    }

    // we want to make the inputs a bit wider then default, we need
    // to do <field><label><input>

    return (
        <Form className={css.connectorEditorSubContainer}>
          <Segment className={css.connectorEditorSubSegment} tertiary>
            <Form.Field className={css.firebaseInputField}>
              <label>Server URL</label>
              <Input
                  value={this.props.connector.model.serverURL}
                  onChange={(_e, data) => {
                    changeModel({serverURL: data.value as string})
                  }}/>
            </Form.Field>
            <Form.Field className={css.firebaseInputField}>
              <label>Server URL</label>
              <Input
                  value={this.props.connector.model.userId}
                  onChange={(_e, data) => {
                    changeModel({userId: data.value as string})
                  }}/>
            </Form.Field>
            <Form.Field className={css.firebaseInputField}>
              <label>Conversation ID</label>
              <Input
                  value={this.props.connector.model.conversationId}
                  onChange={(_e, data) => {
                    changeModel({conversationId: data.value as string})
                  }}/>
            </Form.Field>
            {/*<Button primary>Connect</Button>*/}
          </Segment>
        </Form>
    )
  }
}
