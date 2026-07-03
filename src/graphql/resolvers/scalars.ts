import { GraphQLScalarType, Kind } from "graphql";

export const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  description: "ISO-8601 date-time scalar",
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value as string);
  },
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null;
  },
});

export const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description: "Arbitrary JSON value",
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: function parseLiteral(ast): unknown {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return Number(ast.value);
      case Kind.OBJECT: {
        const obj: Record<string, unknown> = {};
        ast.fields.forEach((field) => {
          obj[field.name.value] = parseLiteral(field.value);
        });
        return obj;
      }
      case Kind.LIST:
        return ast.values.map((v) => parseLiteral(v));
      case Kind.NULL:
        return null;
      default:
        return null;
    }
  },
});
