import {BounceDataStore} from "../../api/BounceDataStore";
import {BounceLink} from "../../api/BounceLink";
import {BounceUser} from "../../api/BounceUser";

export class TestableDataStore implements BounceDataStore {
  public onCreateLink: ((link: BounceLink) => Promise<BounceLink>) | undefined = undefined;
  public onLinkFromName: ((name: string) => Promise<BounceLink | null>) | undefined = undefined;
  public onTrack: ((link: BounceLink, peek: boolean) => void) | undefined = undefined;
  public onUserFromEmail: ((email: string) => Promise<BounceUser | null>) | undefined = undefined;

  public createLink(link: BounceLink): Promise<BounceLink> {
    if (this.onCreateLink == null) {
      throw new Error(`Unexpected call to createLink: ${JSON.stringify(link)}`);
    }
    return this.onCreateLink(link);
  }

  public linkFromName(name: string): Promise<BounceLink | null> {
    if (this.onLinkFromName == null) {
      throw new Error(`Unexpected call to linkFromName: ${name}`);
    }
    return this.onLinkFromName(name);
  }

  public track(link: BounceLink, peek: boolean): void {
    if (this.onTrack == null) {
      throw new Error(`Unexpected call to track: ${JSON.stringify(link)}, ${peek}`);
    }
    this.onTrack(link, peek);
  }

  public userFromEmail(email: string): Promise<BounceUser | null> {
    if (this.onUserFromEmail == null) {
      throw new Error(`Unexpected call to userFromEmail: ${email}`);
    }
    return this.onUserFromEmail(email);
  }
}
