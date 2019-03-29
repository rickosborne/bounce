import {injectableType} from "inclined-plane";
import {BounceLink} from "./BounceLink";

export interface BounceApp {
  defaultLink(): BounceLink;

  linkFromName(name: string): Promise<BounceLink | null>;

  track(link: BounceLink, peek: boolean): void;
}

// tslint:disable-next-line:variable-name
export const BounceApp = injectableType<BounceApp>('BounceApp');
