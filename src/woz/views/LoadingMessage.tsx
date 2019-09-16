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
import {Loader} from "semantic-ui-react"
import css from "./woz.module.css"

export interface ILoadingMessageProperties {
  message: string
  detail?: string
}

export const LoadingMessage
    : React.FunctionComponent<ILoadingMessageProperties>
    = (props: ILoadingMessageProperties) => {

  return (
      <div className={css.statusMessage}>
        <Loader
            className={css.statusMessage}
            active={true} size={"massive"}>{props.message}<span
            className={css.detailMessage}>{props.detail !== undefined
                                           ? props.detail
                                           : ""}</span>
        </Loader>
      </div>
  )
}
