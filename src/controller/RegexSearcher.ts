//
//  RegexSearcher
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import {WozModel} from "../model/WozModel";
import * as util from "../util";
import {log} from "./Logger";

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

  public search = async (inQuery, inMaxResultCount): Promise<string[]> => {
    let result: string[] = [];

    if (inQuery.length !== 0) {
      const regex = new RegExp(inQuery, "gi");
      result = util.objectCompactMap(this.data.buttons, ([id, bm]) => {
        // log.debug(id, bm);
        return RegexSearcher._button_matches_query(bm, regex) ? id : undefined;
      }).slice(0, inMaxResultCount);
    }
    return result;
  }

}
