import fetch from 'isomorphic-unfetch';

export type TableDataWrapper<T> = { data: T };

export const actionDataToArray = <T>(data: T | T[]): T[] =>
  data instanceof Array ? data : [data];

export const wrapTableData = <T>(data: T[]): TableDataWrapper<T>[] =>
  data.map((d) => ({ data: d }));

export const unwrapActionData = <T>(
  data: TableDataWrapper<T> | TableDataWrapper<T>[],
): T[] => actionDataToArray(data).map((d) => d.data);

export const fetchJson = async <T>(
  ...args: Parameters<typeof fetch>
): Promise<T> => (await (await fetch(...args)).json()) as T;
