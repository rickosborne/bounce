import console from 'console';

import {BounceLogger} from "../api/BounceLogger";

@BounceLogger.implementation
export class BounceConsoleLogger implements BounceLogger {
  /* istanbul ignore next */
  constructor(private readonly _console: BounceLogger = console) {
  }

  public debug(...args: any[]): void {
    this._console.debug(...args);
  }

  public error(...args: any[]): void {
    this._console.error(...args);
  }

  public info(...args: any[]): void {
    this._console.info(...args);
  }
}
