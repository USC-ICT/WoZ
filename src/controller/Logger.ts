export class Logger {
  public error = (...obj: any[]): void => {
    console.log.apply(null, obj);
  }
  public debug = (...obj: any[]): void => {
    console.log.apply(null, obj);
  }
}

export const log = new Logger();
