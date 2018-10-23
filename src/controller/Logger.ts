
export class Logger {
  public error = (...obj: any[]): void => {
    console.error.apply(null, obj);
  }
  public debug = (...obj: any[]): void => {
    console.info.apply(null, obj);
  }
}

export const log = new Logger();
