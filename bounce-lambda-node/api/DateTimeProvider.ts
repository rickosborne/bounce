import {injectableType} from "inclined-plane";

export interface DateTimeProvider {
  dateNow(): Date;
}

// tslint:disable-next-line:variable-name
export const DateTimeProvider = injectableType<DateTimeProvider>('DateTimeProvider');
