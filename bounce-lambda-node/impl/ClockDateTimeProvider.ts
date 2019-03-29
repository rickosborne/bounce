import {DateTimeProvider} from "../api/DateTimeProvider";

@DateTimeProvider.implementation
export class ClockDateTimeProvider implements DateTimeProvider {
  public dateNow(): Date {
    return new Date();
  }
}
