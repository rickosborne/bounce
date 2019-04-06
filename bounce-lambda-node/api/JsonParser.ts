export interface Attr<PARENT extends { [key: string]: CHILD }, CHILD> {
  converter: (value: any) => CHILD | undefined;
  key: string;
  optional: boolean;
  setter: (parent: PARENT, child?: CHILD) => void;
  typeName: string;
}

export interface JsonParser<INTERFACE> {
  parse(object: object | null): INTERFACE | null;
}

export interface JsonParserBuilder<INTERFACE, COMPOSED> {
  optionalDate<KEY extends string & keyof INTERFACE, U extends (Date | undefined) & INTERFACE[KEY]>(
    key: KEY,
    throwOnError?: boolean,
  ): JsonParserBuilder<INTERFACE, COMPOSED & { [U in KEY]?: Date }>;

  optionalInt<KEY extends string & keyof INTERFACE, U extends (number | undefined) & INTERFACE[KEY]>(
    key: KEY,
    throwOnError?: boolean,
  ): JsonParserBuilder<INTERFACE, COMPOSED & { [U in KEY]?: number }>;

  optionalString<KEY extends string & keyof INTERFACE, U extends (string | undefined) & INTERFACE[KEY]>(
    key: KEY,
    throwOnError?: boolean,
  ): JsonParserBuilder<INTERFACE, COMPOSED & { [U in KEY]?: string }>;

  parser(): JsonParser<COMPOSED extends INTERFACE ? INTERFACE : void>;

  requiredString<KEY extends string & keyof INTERFACE, U extends string & NonNullable<INTERFACE[KEY]>>(
    key: KEY,
    throwOnError?: boolean,
  ): JsonParserBuilder<INTERFACE, COMPOSED & { [U in KEY]: string }>;
}

export interface KeyedObject {
  [key: string]: any;
}
