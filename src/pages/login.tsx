import { Box, CircularProgress, Paper, Typography } from '@material-ui/core';
import { NextPage } from 'next';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFirebase } from 'react-redux-firebase';
import { RootState } from '../rootReducer';
import { setStatus } from './loginSlice';

const Login: NextPage<{ token?: string }> = ({ token }) => {
  const { status, error } = useSelector((state: RootState) => state.login);
  const dispatch = useDispatch();
  const firebase = useFirebase();

  async function signIn(): Promise<void> {
    if (token) {
      try {
        await firebase.login({ token, profile: {} });
        window.close();
      } catch (error) {
        dispatch(
          setStatus({ status: 'Invalid token!', error: error.toString() }),
        );
      }
    } else {
      dispatch(setStatus({ status: 'Missing token!' }));
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
