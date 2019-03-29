import {injectableType} from "inclined-plane";
import {BounceLink} from "./BounceLink";
import {BounceUser} from "./BounceUser";

export interface BounceDataStore {
  createLink(link: BounceLink): Promise<BounceLink>;

  linkFromName(name: string): Promise<BounceLink | null>;

  track(link: BounceLink, peek: boolean): void;

  userFromEmail(email: string): Promise<BounceUser | null>;
}

// tslint:disable-next-line:variable-name
export const BounceDataStore = injectableType<BounceDataStore>('BounceDataStore');
