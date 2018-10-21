//
//  RegexSearcher
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as util from "../../util";
import {WozModel} from "./WozModel";

export class RegexSearcher {

  public static _button_matches_query(inButtonModel, inRegex) {
    for (const badgeID in inButtonModel.badges) {
      if (inButtonModel.badges.hasOwnProperty(badgeID)) {
        if (inButtonModel.badges[badgeID].search(inRegex) >= 0) {
          return true;
        }
      }
    }

    return (util.defined(inButtonModel.tooltip) &&
            inButtonModel.tooltip.search(inRegex) >= 0)
           || (util.defined(inButtonModel.label) &&
               inButtonModel.label.search(inRegex) >= 0);
  }
  private data: WozModel;

  constructor(inData) {
    this.data = inData;
  }

  public search(inQuery, inMaxResultCount, inCallback) {

    const result = [];
    if (inQuery.length !== 0) {
      const regex = new RegExp(inQuery, "gi");

      for (const buttonID in this.data.buttons) {
        if (this.data.buttons.hasOwnProperty(buttonID)) {
          const theButton = this.data.buttons[buttonID];
          if (RegexSearcher._button_matches_query(theButton, regex)) {
            result.push(buttonID);
            if (result.length >= inMaxResultCount) {
              break;
            }
          }
        }
      }
    }

    inCallback(result);
  }

}
