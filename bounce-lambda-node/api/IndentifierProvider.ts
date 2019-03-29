import {injectableType} from "inclined-plane";

export type Identifier = string;

export interface IdentifierProvider {
  fromText(text: string, length?: number): Identifier;

  randomId(length?: number): Identifier;

  timeId(time?: Date, length?: number): Identifier;
}

// tslint:disable-next-line:variable-name
export const IdentifierProvider = injectableType<IdentifierProvider>('IdentifierProvider');
