import {Attr, JsonParser, JsonParserBuilder, KeyedObject} from "../api/JsonParser";

export class JsonParserImpl<INTERFACE, COMPOSED = {}> implements JsonParser<INTERFACE> {
  private readonly attrs: Array<Attr<any, any>> = [];

  constructor(private readonly typeName: string) {
  }

  protected dateConverter(throwOnError: boolean): (value: any) => Date | undefined {
    return (v: any) => {
      if (v == null) {
        return undefined;
      }
      if (typeof v === 'number' || typeof v === 'string') {
        return new Date(v);
      }
      if (v instanceof Date) {
        return v;
      }
      if (throwOnError) {
        throw new Error(`Cannot convert "${typeof v}" to Date`);
      }
      return undefined;
    };
  }

  protected intConverter(throwOnError: boolean): (value: any) => number | undefined {
    return (v: any) => {
      if (v == null) {
        return undefined;
      }
      if (typeof v === 'number') {
        if (Math.floor(v) !== v) {
          if (throwOnError) {
            throw new Error(`Not an integer: ${v}`);
          }
          return undefined;
        }
        return v;
      }
      if (typeof v === 'string') {
        return parseInt(v, 10);
      }
      if (throwOnError) {
        throw new Error(`Cannot convert "${typeof v}" to integer`);
      }
      return undefined;
    };
  }

  public optionalDate<KEY extends string & keyof INTERFACE, FIELD extends (Date | undefined) & INTERFACE[KEY]>(
    key: KEY,
    throwOnError: boolean = true,
  ): JsonParserImpl<INTERFACE, COMPOSED & { [U in KEY]?: Date }> {
    this.attrs.push({
      key,
      converter: this.dateConverter(throwOnError),
      optional: true,
      setter: this.optionalSetter<KEY, FIELD>(key),
      typeName: 'Date',
    });
    return this;
  }

  public optionalInt<KEY extends string & keyof INTERFACE, FIELD extends (number | undefined) & INTERFACE[KEY]>(
    key: KEY,
    throwOnError: boolean = true,
  ): JsonParserImpl<INTERFACE, COMPOSED & { [U in KEY]?: number }> {
    this.attrs.push({
      key,
      converter: this.intConverter(throwOnError),
      optional: true,
      setter: this.optionalSetter<KEY, FIELD>(key),
      typeName: 'number',
    });
    return this;
  }

  protected optionalSetter<KEY extends string & keyof INTERFACE, V extends INTERFACE[KEY]>(key: KEY) {
    return (t: INTERFACE, u: V) => {
      if (u != null) {
        t[key] = u;
      }
    };
  }

  public optionalString<KEY extends string & keyof INTERFACE, FIELD extends (string | undefined) & INTERFACE[KEY]>(
    key: KEY,
    throwOnError: boolean = true,
  ): JsonParserImpl<INTERFACE, COMPOSED & { [U in KEY]?: string }> {
    this.attrs.push({
      key,
      converter: this.stringConverter(throwOnError),
      optional: true,
      setter: this.optionalSetter<KEY, FIELD>(key),
      typeName: 'string',
    });
    return this;
  }

  public parse(object: KeyedObject | null): INTERFACE | null {
    if (object == null) {
      return null;
    }
    const result: INTERFACE = {} as any;
    for (const attr of this.attrs) {
      const element: any = object[attr.key] as any;
      const value = attr.converter(element);
      if (value !== undefined) {
        attr.setter(result, value);
      } else if (!attr.optional) {
        return null;
      }
    }
    return result;
  }

  public parser(): JsonParser<COMPOSED extends INTERFACE ? INTERFACE : void> {
    return this as any;
  }

  protected requiredSetter<KEY extends string & keyof INTERFACE, V extends INTERFACE[KEY]>(key: KEY) {
    return (t: INTERFACE, u: V) => {
      if (u != null) {
        t[key] = u;
      } else {
        /* istanbul ignore next */
        throw new Error(`Missing required "${key}" in ${this.typeName}`);
      }
    };
  }

  public requiredString<KEY extends string & keyof INTERFACE, FIELD extends string & NonNullable<INTERFACE[KEY]>>(
    key: KEY,
    throwOnError: boolean = true,
  ): JsonParserImpl<INTERFACE, COMPOSED & { [U in KEY]: string }> {
    this.attrs.push({
      key,
      converter: this.stringConverter(throwOnError),
      optional: false,
      setter: this.requiredSetter<KEY, FIELD>(key),
      typeName: 'string',
    });
    return this;
  }

  private stringConverter(throwOnError: boolean): (value: any) => string | undefined {
    return (v: any) => {
      if (v == null) {
        return undefined;
      }
      if (typeof v === 'string') {
        return v;
      }
      if (throwOnError) {
        throw new Error(`Cannot convert "${typeof v}" to string`);
      }
      return undefined;
    };
  }

  public toString(): string {
    return `interface ${this.typeName} {\n` + this.attrs
      .map((attr) => {
        return `  ${attr.key}${attr.optional ? '?' : ''}: ${attr.typeName};`;
      })
      .join('\n') + `\n}`;
  }
}

export function buildParser<INTERFACE, COMPOSED = {}>(typeName: string): JsonParserBuilder<INTERFACE, COMPOSED> {
  return new JsonParserImpl<INTERFACE>(typeName);
}
