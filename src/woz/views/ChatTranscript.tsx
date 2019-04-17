import * as React from "react"
import css from "./ChatTranscript.module.css"
import {IDialogue} from "../model/DialogueModel"

export interface IChatTranscriptProperties {
  dialogue: IDialogue
  us: string
  them: string[]
}

export class ChatTranscript
    extends React.Component<IChatTranscriptProperties, {}> {

  constructor(props: IChatTranscriptProperties) {
    super(props)
  }

  private messageList?: HTMLDivElement

  private scrollToBottom() {
    if (this.messageList === undefined) { return }
    const scrollHeight = this.messageList.scrollHeight
    const height = this.messageList.clientHeight
    const maxScrollTop = scrollHeight - height
    this.messageList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0
  }

  // noinspection JSUnusedGlobalSymbols
  public componentDidUpdate = () => {
    this.scrollToBottom()
  }

  // noinspection JSUnusedGlobalSymbols
  public componentDidMount = () => {
    this.scrollToBottom()
  }

  public render(): React.ReactNode {

    const rows = this.props.dialogue.messages.map((message, index) => {
      const cellClass = message.userID === undefined
                        ? css.systemCell
                        : message.userID === this.props.us
                          ? css.ourCell
                          : css.theirCell
      const rowClass = message.userID === undefined
                       ? css.systemRow
                       : message.userID === this.props.us
                         ? css.ourRow
                         : css.theirRow
      const visibleUserID = message.userID !== undefined
                            && message.userID !== this.props.us
                            && this.props.them.find(
          (id) => (id === message.userID)) === undefined
                            ? <span className={css.them}>{message.userID}: </span>
                            : ""
      return <div className={css.row + " " + rowClass} key={index}>
        <div className={css.cell + " " + cellClass}>{visibleUserID}{message.text}</div>
      </div>
    })

    return <div className={css.transcript}>
      <div
          className={css.scrollable}
          ref={(div) => {this.messageList = div || undefined}}>{rows}</div>
    </div>
  }
}

