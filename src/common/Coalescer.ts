type CoalescerHandler = () => void;

export class Coalescer {
  private delay: number;
  private timer?: number;
  private handler?: CoalescerHandler;

  constructor() {
    this.delay = 1000;
  }

  // noinspection JSUnusedGlobalSymbols
  public append = (handler: CoalescerHandler, delay?: number) => {
    this.stop();
    this.handler = handler;
    if (delay !== undefined) { this.delay = delay; }
    this.timer = window.setTimeout(this._timerCallback, this.delay);
  }

  public stop = () => {
    if (this.timer === undefined) { return; }
    window.clearTimeout(this.timer);
    this.timer = undefined;
  }

  private _timerCallback = () => {
    if (this.timer === undefined) { return; }
    this.timer = undefined;
    if (this.handler === undefined) { return; }
    this.handler();
  }
}
