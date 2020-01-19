import { CssBaseline } from '@material-ui/core';
import App from 'next/app';
import React from 'react';

export default class MyApp extends App {
  public render() {
    const { Component, pageProps } = this.props;
    return (
      <React.Fragment>
        <CssBaseline />
        <Component {...pageProps} />
      </React.Fragment>
    );
  }
}
