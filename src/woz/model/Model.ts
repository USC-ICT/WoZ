import {WozModel} from "./WozModel";

export interface IWozCollectionModel {
  [index: string]: WozModel;
}

export interface IWozProvider {
  loadWozCollection: () => Promise<IWozCollectionModel>;
  isEqual: (other: IWozProvider) => boolean;
}
