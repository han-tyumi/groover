import { IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import fetch from 'isomorphic-unfetch';
import { OptionsObject, useSnackbar } from 'notistack';
import React from 'react';

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
 * The action can also return a cleanup function to be called when the action is
 * cancelled.
 *
 * @param action The action to delay.
 * @param ms The number of milliseconds to delay the action.
 * @returns A function that can be called to cancel the action.
 */
export const delay = (
  action: () => void | (() => void),
  ms: number,
): (() => void) => {
  let cleanup: void | (() => void);
  const start = window.setTimeout(() => (cleanup = action()), ms);
  return (): void => {
    window.clearTimeout(start);
    cleanup && cleanup();
  };
};

interface ActionExecutorOptions {
  /** The action (verb; beginning of sentence). */
  verb: string;

  /** The action to execute. Can return a message to be displayed on success. */
  action: () => Promise<void | string> | void | string;

  /** Snackbar variant to use on success. */
  variant?: OptionsObject['variant'];

  /** Maximum amount of time the action is expected to take. */
  expected?: number;
}

/**
 * Provides a function that executes the given action and reports any errors and
 * when the action is taking longer then expected.
 */
export const useActionExecutor = (): ((
  options: ActionExecutorOptions,
) => Promise<void>) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  /**
   * Executes the given action and reports any errors and
   * when the action is taking longer then expected.
   * @param options Action executor options.
   */
  return async ({
    verb,
    action,
    variant = 'success',
    expected = 1000,
  }): Promise<void> => {
    const cancel = delay(() => {
      const id = enqueueSnackbar(`${verb} taking longer than expected...`, {
        variant: 'info',
        persist: true,
      });

      return (): void => void closeSnackbar(id);
    }, expected);

    try {
      const message = await action();
      cancel();
      if (message) {
        enqueueSnackbar(message, { variant });
      }
    } catch (error) {
      cancel();
      enqueueSnackbar(error.toString(), {
        variant: 'error',
        persist: true,
        // eslint-disable-next-line react/display-name
        action: (key) =>
          React.createElement(
            IconButton,
            { color: 'inherit', onClick: () => closeSnackbar(key) },
            React.createElement(Close),
          ),
      });
    }
  };
};
