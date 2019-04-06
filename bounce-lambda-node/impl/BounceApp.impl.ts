import {BounceApp} from "../api/BounceApp";
import {BounceDataStore} from "../api/BounceDataStore";
import {BounceLink} from "../api/BounceLink";

@BounceApp.implementation
export class BounceAppImpl implements BounceApp {
  public static readonly LINK_DEFAULT: BounceLink = {
    href: "https://rickosborne.org/",
    name: "",
    title: "rick osborne dot org",
  };

  constructor(
    @BounceDataStore.required private readonly store: BounceDataStore,
  ) {}

  public createLink(link: BounceLink): Promise<BounceLink | null> {
    return this.store.createLink(link);
  }

  public defaultLink(): BounceLink {
    return BounceAppImpl.LINK_DEFAULT;
  }

  public linkFromName(name: string): Promise<BounceLink | null> {
    return this.store.linkFromName(name);
  }

  public track(link: BounceLink, peek: boolean): void {
    this.store.track(link, peek);
  }
}
