//
//  RegexSearcher
//  UIProject
//
//  Created by Anton Leuski on 12/4/16.
//  Copyright © 2016 USC/ICT. All rights reserved.
//
import * as util from '../../util.js';
export class RegexSearcher {
    constructor(inData) {
        this.data = inData;
    }
    static _button_matches_query(inButtonModel, inRegex) {
        for (let badge_id in inButtonModel.badges) {
            if (inButtonModel.badges.hasOwnProperty(badge_id)) {
                if (inButtonModel.badges[badge_id].search(inRegex) >= 0) {
                    return true;
                }
            }
        }
        return (util.defined(inButtonModel.tooltip) &&
            inButtonModel.tooltip.search(inRegex) >= 0)
            || (util.defined(inButtonModel.label) &&
                inButtonModel.label.search(inRegex) >= 0);
    }
    search(inQuery, inMaxResultCount, inCallback) {
        const result = [];
        if (inQuery.length !== 0) {
            const regex = new RegExp(inQuery, "gi");
            for (let button_id in this.data.buttons) {
                if (this.data.buttons.hasOwnProperty(button_id)) {
                    const theButton = this.data.buttons[button_id];
                    if (RegexSearcher._button_matches_query(theButton, regex)) {
                        result.push(button_id);
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
//# sourceMappingURL=RegexSearcher.js.map