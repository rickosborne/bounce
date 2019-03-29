import {DynamoDB} from "aws-sdk";

interface DynamoAttr<PARENT extends { [key: string]: CHILD }, CHILD> {
  converter: (value: DynamoDB.AttributeValue) => CHILD | undefined;
  key: string;
  optional: boolean;
  setter: (parent: PARENT, child?: CHILD) => void;
}

export interface Deserializer<T> {
  deserialize(map: DynamoDB.AttributeMap | null): T | null;
}

export class DynamoParser<T, C = {}> implements Deserializer<T> {
  private readonly attrs: Array<DynamoAttr<any, any>> = [];

  constructor(private readonly typeName: string) {
  }

  private dateConverter(): (value: DynamoDB.AttributeValue) => Date | undefined {
    return (v: DynamoDB.AttributeValue) => v != null && v.N != null ? new Date(parseInt(v!.N, 10)) : undefined;
  }

  public deserialize(map: DynamoDB.AttributeMap | null): T | null {
    if (map == null) {
      return null;
    }
    const result = {};
    for (const attr of this.attrs) {
      const element = map[attr.key];
      const value = element == null ? undefined : attr.converter(element);
      if (value !== undefined) {
        attr.setter(result, value);
      } else if (!attr.optional) {
        return null;
      }
    }
    return <T> result;
  }

  private intConverter(): (value: DynamoDB.AttributeValue) => number | undefined {
    return (v: DynamoDB.AttributeValue) => v != null && v.N != null ? parseInt(v!.N, 10) : undefined;
  }

  public optionalDate<KEY extends string & keyof T, U extends (Date | undefined) & T[KEY]>(key: KEY):
    DynamoParser<T, C & { [U in KEY]?: Date }> {
    this.attrs.push({
      key,
      converter: this.dateConverter(),
      optional: true,
      setter: this.optionalSetter<KEY, U>(key),
    });
    return this;
  }

  public optionalInt<KEY extends string & keyof T, U extends (number | undefined) & T[KEY]>(key: KEY):
    DynamoParser<T, C & { [U in KEY]?: number }> {
    this.attrs.push({
      key,
      converter: this.intConverter(),
      optional: true,
      setter: this.optionalSetter<KEY, U>(key),
    });
    return <any> this;
  }

  private optionalSetter<KEY extends string & keyof T, V extends T[KEY]>(key: KEY) {
    return (t: T, u: V) => {
      if (u != null) {
        t[key] = u;
      }
    };
  }

  public optionalString<KEY extends string & keyof T, U extends (string | undefined) & T[KEY]>(key: KEY):
    DynamoParser<T, C & { [U in KEY]?: string }> {
    this.attrs.push({
      key,
      converter: this.stringConverter(),
      optional: true,
      setter: this.optionalSetter<KEY, U>(key),
    });
    return this;
  }

  public parser(): Deserializer<C extends T ? T : void> {
    return <any> this;
  }

  private requiredSetter<KEY extends string & keyof T, V extends T[KEY]>(key: KEY) {
    return (t: T, u: V) => {
      if (u != null) {
        t[key] = u;
      } else {
        /* istanbul ignore next */
        throw new Error(`Missing required "${key}" in ${this.typeName}`);
      }
    };
  }

  public requiredString<KEY extends string & keyof T, U extends string & NonNullable<T[KEY]>>(key: KEY):
    DynamoParser<T, C & { [U in KEY]: string }> {
    this.attrs.push({
      key,
      converter: this.stringConverter(),
      optional: false,
      setter: this.requiredSetter<KEY, U>(key),
    });
    return this;
  }

  private stringConverter(): (value: DynamoDB.AttributeValue) => string | undefined {
    return (v: DynamoDB.AttributeValue) => v != null && v.S != null ? v!.S : undefined;
  }
}
