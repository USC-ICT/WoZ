//
//  RegexSearcher
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//

import * as util from "../../common/util";
import {ButtonModel} from "../model/ButtonModel";
import {IWozContent} from "../model/WozModel";

// import {log} from "./Logger";

export class RegexSearcher {

  public static _button_matches_query(
      inButtonModel: ButtonModel, inRegex: RegExp): boolean {
    for (const badge of Object.values(inButtonModel.badges)) {
      if (badge.search(inRegex) >= 0) {
        return true;
      }
    }

    return inButtonModel.tooltip.search(inRegex) >= 0
        || inButtonModel.label.search(inRegex) >= 0;
  }

  private data: IWozContent;

  constructor(inData: IWozContent) {
    this.data = inData;
  }

  public search = async (inQuery: string, inMaxResultCount: number): Promise<string[]> => {
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
