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
import {
  Button as SUIButton,
  Container,
  Grid,
  Icon,
  Input,
  SemanticICONS,
} from "semantic-ui-react"
import {WozModel} from "../model/WozModel"
import css from "./woz.module.css"
import {WozSelector} from "./WozSelector"

export interface IWozHeaderProperties {
  onChangeWoz: (newWoz: WozModel) => void
  onBack?: () => void
  onSearch?: (value: string) => void
  icon?: SemanticICONS
  allWozs: { [s: string]: WozModel }
  selectedWoz?: WozModel
}

export const WozHeader
    : React.StatelessComponent<IWozHeaderProperties>
    = (props: IWozHeaderProperties) => {

  let wozSelector: any = null
  let searchField: any = null
  let backButton: any = null

  if (props.selectedWoz !== undefined) {
    wozSelector = <WozSelector
        onChange={props.onChangeWoz}
        value={props.selectedWoz}
        values={props.allWozs}/>

    if (props.onSearch !== undefined) {
      const onSearch = props.onSearch
      searchField = <Input
          icon={{name: "search", circular: true, link: true}}
          className={css.searchField}
          onChange={(_event, data) => onSearch(data.value)}
          placeholder="Search..."/>
    }
  }

  if (props.onBack !== undefined) {
    backButton = <SUIButton
        icon
        onClick={props.onBack}>
      <Icon name={props.icon !== undefined
                  ? props.icon : "cogs"}/>
    </SUIButton>
  }

  return <Container className={css.tableHeader} fluid>
    <Grid columns={2} verticalAlign={"middle"}>
      <Grid.Column floated="left">
        {searchField}
      </Grid.Column>
      <Grid.Column textAlign="right" floated="right">
        <div id={css.wozSelectorGroupId}>
          {wozSelector}
          {backButton}
        </div>
      </Grid.Column>
    </Grid>
  </Container>
}
