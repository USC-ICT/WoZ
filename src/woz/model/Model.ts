import {WozModel} from "./WozModel";

export interface IWozCollectionModel {
  title: string;
  wozs: {[index: string]: WozModel};
}

export interface IWozDataSource {
  readonly id: string;
  readonly title: string;
  loadWozCollection: () => Promise<IWozCollectionModel>;
  isEqual: (other?: IWozDataSource) => boolean;
}
