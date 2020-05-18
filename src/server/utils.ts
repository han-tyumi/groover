export type QueryValue = string | string[];

/**
 * Attempts to parse the query value as a string.
 * @param val The query value.
 */
export const asString = (val: QueryValue): string => {
  if (val instanceof Array) {
    throw new Error('Value is not string!');
  }
  return val;
};

/**
 * Attempts to parse the query value as an array of strings.
 * @param val The query value.
 */
asString.Array = (val: QueryValue): string[] => {
  if (val instanceof Array) {
    return val;
  }
  throw new Error('Value is not array!');
};

/**
 * Attempts to parse the query value as an integer.
 * @param val The query value.
 */
export const asInt = (val: QueryValue): number => parseInt(asString(val), 10);

/**
 * Attempts to parse the query value as an array of integers.
 * @param val The query value.
 */
asInt.Array = (val: QueryValue): number[] =>
  asString.Array(val).map((v) => parseInt(v, 10));

/**
 * Attempts to parse the query value as a float.
 * @param val The query value.
 */
export const asFloat = (val: QueryValue): number => parseFloat(asString(val));

/**
 * Attempts to parse the query value as an array of floats.
 * @param val The query value.
 */
asFloat.Array = (val: QueryValue): number[] =>
  asString.Array(val).map((v) => parseFloat(v));

/**
 * Attempts to parse the query value as a boolean.
 * @param val The query value.
 */
export const asBool = (val: QueryValue): boolean => {
  if (val === 'true') {
    return true;
  } else if (val === 'false') {
    return false;
  }
  throw new Error('Value is not boolean!');
};

/**
 * Attempts to parse the query value as an array of booleans.
 * @param val The query value.
 */
asBool.Array = (val: QueryValue): boolean[] =>
  asString.Array(val).map((v) => asBool(v));
