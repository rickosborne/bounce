import {injectableType} from "inclined-plane";

export type BounceLogLine = (...args: any[]) => void;

export interface BounceLogger {
  debug: BounceLogLine;
  error: BounceLogLine;
  info: BounceLogLine;
}

// tslint:disable-next-line:variable-name
export const BounceLogger = injectableType<BounceLogger>('BounceLogger');
