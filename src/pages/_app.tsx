import { Box, Container, CssBaseline, ThemeProvider } from '@material-ui/core';
import App from 'next/app';
import React from 'react';

import theme from '../client/theme';

export default class MyApp extends App {
  public componentDidMount() {
    const jssStyles = document.querySelector('#jss-server-side');
    jssStyles?.parentElement?.removeChild(jssStyles);
  }

  public render() {
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
            <Component {...pageProps} />
          </Box>
        </Container>
      </ThemeProvider>
    );
  }
}
