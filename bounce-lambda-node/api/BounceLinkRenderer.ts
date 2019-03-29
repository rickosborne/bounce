import {injectableType} from "inclined-plane";
import {BounceLink} from "./BounceLink";

export interface BounceLinkRenderer {
  asHTML(link: BounceLink): string;
}

// tslint:disable-next-line:variable-name
export const BounceLinkRenderer = injectableType<BounceLinkRenderer>('BounceLinkRenderer');
