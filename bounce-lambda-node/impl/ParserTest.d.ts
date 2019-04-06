export interface OneRequiredString {
  req: string;
}

export interface OneOptionalString {
  opt?: string;
}

export interface OneOptionalInt {
  opt?: number;
}

export interface OneOptionalDate {
  opt?: Date;
}

export interface MegaCombo {
  optDate?: Date;
  optInt?: number;
  optString?: string;
  reqString: string;
}
