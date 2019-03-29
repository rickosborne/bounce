import {BounceLogger, BounceLogLine} from "../api/BounceLogger";

export class TestableLogger implements BounceLogger {
  constructor(
    private readonly onDebug: BounceLogLine | null,
    private readonly onError: BounceLogLine | null,
    private readonly onInfo: BounceLogLine | null,
  ) {
  }

  // noinspection JSUnusedGlobalSymbols
  public debug(...args: any[]): void {
    if (this.onDebug == null) {
      throw new Error(`Unexpected call to debug(${JSON.stringify(args)})`);
    }
    this.onDebug(...args);
  };

  // noinspection JSUnusedGlobalSymbols
  public error(...args: any[]): void {
    if (this.onError == null) {
      throw new Error(`Unexpected call to error(${JSON.stringify(args)})`);
    }
    this.onError(...args);
  };

  // noinspection JSUnusedGlobalSymbols
  public info(...args: any[]): void {
    if (this.onInfo == null) {
      throw new Error(`Unexpected call to info(${JSON.stringify(args)})`);
    }
    this.onInfo(...args);
  };
}
