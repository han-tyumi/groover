import { Box, Container, CssBaseline, ThemeProvider } from '@material-ui/core';
import App from 'next/app';
import React from 'react';
import { Provider } from 'react-redux';
import { ReactReduxFirebaseProvider } from 'react-redux-firebase';
import { rrfProps } from '../client/firebase';
import theme from '../client/theme';
import store from '../store';

export default class MyApp extends App {
  public componentDidMount(): void {
    const jssStyles = document.querySelector('#jss-server-side');
    jssStyles?.parentElement?.removeChild(jssStyles);
  }

  public render(): JSX.Element {
    const { Component, pageProps } = this.props;

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginTop={8}
          >
            <Provider store={store}>
              <ReactReduxFirebaseProvider {...rrfProps}>
                <Component {...pageProps} />
              </ReactReduxFirebaseProvider>
            </Provider>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }
}
