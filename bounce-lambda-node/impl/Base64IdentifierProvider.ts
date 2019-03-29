import {Identifier, IdentifierProvider} from "../api/IndentifierProvider";
import {BigInt} from "./BigInt";

export const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
export const CHARS_LENGTH_NUM: number = CHARS.length;
export const CHARS_LENGTH_BIG: BigInt = BigInt.from(CHARS_LENGTH_NUM);
export const LENGTH_DEFAULT = 8;
export const DIGITS_PER_CHAR = Math.log10(CHARS_LENGTH_NUM);

@IdentifierProvider.implementation
export class Base64IdentifierProvider implements IdentifierProvider {
  /* istanbul ignore next */
  private fromBigInt(num: BigInt, length: number = LENGTH_DEFAULT): Identifier {
    const chars: string[] = [];
    let remain = num;
    while (remain.isNonZero && chars.length < length) {
      const [whole, remainder] = remain.div(CHARS_LENGTH_BIG);
      chars.unshift(CHARS[remainder.num]);
      remain = whole;
    }
    return chars.join('');
  }

  public fromText(text: string, length: number = LENGTH_DEFAULT): Identifier {
    const vals: number[] = new Array(length);
    let j = length;
    for (let i = 0; i < text.length; i++) {
      j -= 1;
      if (j < 0) {
        j = length - 1;
      }
      vals[j] = ((vals[j] || 0) + text.charCodeAt(i)) % CHARS_LENGTH_NUM;
    }
    return vals
      .filter((v) => v !== undefined)
      .map((n) => CHARS[n])
      .join('')
      .substring(0, length);
  }

  private randomDigits(length: number): BigInt {
    let s = "";
    while (s.length < length) {
      s += String(Math.random()).replace(/^0\./, '');
    }
    return BigInt.from(s.substring(0, length));
  }

  public randomId(length: number = LENGTH_DEFAULT): Identifier {
    const charLen: number = Math.ceil(DIGITS_PER_CHAR * length);
    const digits = this.randomDigits(charLen);
    return this.fromBigInt(digits, length);
  }

  public timeId(time?: number | Date, length: number = LENGTH_DEFAULT): Identifier {
    const t: Date = time == null ? new Date() : time instanceof Date ? time : new Date(time);
    const digits = BigInt.from(String(t.valueOf()).replace(/\D/g, ''));
    return this.fromBigInt(digits, length);
  }
}
