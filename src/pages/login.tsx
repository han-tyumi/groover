import { Box, CircularProgress, Paper, Typography } from '@material-ui/core';
import { NextPage } from 'next';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useFirebase } from 'react-redux-firebase';

const Login: NextPage<{ token?: string }> = ({ token }) => {
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();

  const firebase = useFirebase();

  async function signIn(): Promise<void> {
    if (token) {
      try {
        await firebase.login({ token, profile: {} });
        window.close();
      } catch (error) {
        setStatus('Invalid token!');
        setError(error.toString());
      }
    } else {
      setStatus('Missing token!');
    }
  }

  useEffect(() => {
    signIn();
  }, []);

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

Login.propTypes = {
  token: PropTypes.string,
};

Login.getInitialProps = ({
  query: { token },
}): {
  token?: string | undefined;
} => (typeof token !== 'string' ? { token: undefined } : { token });

export default Login;
