export interface IWozConnector {
  id: string;
  title: string;

  component(): any;
}

