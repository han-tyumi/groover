import { CssBaseline, ThemeProvider } from '@material-ui/core';
import App from 'next/app';
import React from 'react';
import theme from '../theme';

export default class MyApp extends App {
  public render() {
    const { Component, pageProps } = this.props;
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    );
  }
}
