import { Box, CircularProgress, Paper, Typography } from '@material-ui/core';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';

import firebaseApp from '../client/firebase';

const Login: NextPage<{ token?: string }> = ({ token }) => {
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    signIn();
  }, []);

  async function signIn() {
    if (token) {
      try {
        await firebaseApp.auth().signInWithCustomToken(token);
        window.close();
      } catch (error) {
        setStatus('Invalid token!');
        setError(error.toString());
      }
    } else {
      setStatus('Missing token!');
    }
  }

  return (
    <Paper>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        padding={4}
      >
        <Box display="flex" justifyContent="center" alignItems="center">
          {!status && (
            <Box mr={1}>
              <CircularProgress size={24} />
            </Box>
          )}
          <Typography variant="h5">{status || 'Logging in...'}</Typography>
        </Box>
        {error && <Typography variant="caption">{error}</Typography>}
      </Box>
    </Paper>
  );
};

Login.getInitialProps = async ({ query: { token } }) =>
  typeof token !== 'string' ? { token: undefined } : { token };

export default Login;
