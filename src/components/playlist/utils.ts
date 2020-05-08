import fetch from 'isomorphic-unfetch';

/** Wraps material-table data so that properties added by the library do not affect data immutability. */
export type TableDataWrapper<T> = { data: T };

/**
 * Converts material-table action data to an array if it is not already in one.
 * @param data The material-table action data.
 */
export const actionDataToArray = <T>(data: T | T[]): T[] =>
  data instanceof Array ? data : [data];

/**
 * Wraps material-table data so that properties added by the library do not affect data immutability.
 * @param data The material-table data to wrap.
 */
export const wrapTableData = <T>(data: T[]): TableDataWrapper<T>[] =>
  data.map((d) => ({ data: d }));

/**
 * Unwraps material-table action data.
 * @param data The material-table action data.
 */
export const unwrapActionData = <T>(
  data: TableDataWrapper<T> | TableDataWrapper<T>[],
): T[] => actionDataToArray(data).map((d) => d.data);

/**
 * Wrapper to simply return the JSON response from a fetch request.
 */
export const fetchJson = async <T>(
  ...args: Parameters<typeof fetch>
): Promise<T> => (await (await fetch(...args)).json()) as T;

/**
 * Delays an action by a number of milliseconds.
 *
 * @param action The action to delay.
 * @param ms The number of milliseconds to delay the action.
 * @returns A function that can be called to cancel the action.
 */
export const delay = (action: () => void, ms: number): (() => void) => {
  const start = window.setTimeout(() => action(), ms);
  return (): void => void window.clearTimeout(start);
};
