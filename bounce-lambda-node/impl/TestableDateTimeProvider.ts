import {DateTimeProvider} from "../api/DateTimeProvider";

export class TestableDateTimeProvider implements DateTimeProvider {
  public now: Date = new Date();

  public dateNow(): Date {
    return this.now;
  }
}
