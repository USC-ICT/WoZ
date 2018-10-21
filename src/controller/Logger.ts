export class Logger {
  public error = (...obj) => {
    console.log.apply(null, obj);
  }
  public debug = (...obj) => {
    console.log.apply(null, obj);
  }
}

export const log = new Logger();
