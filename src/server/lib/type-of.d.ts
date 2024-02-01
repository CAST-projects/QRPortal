export type KnownTypes = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "function" | "object" | "nan" | "array" | "null" | "promise";

export default function typeOf(value: any): KnownTypes
