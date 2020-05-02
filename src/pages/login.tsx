import { Box, CircularProgress, Paper, Typography } from '@material-ui/core';
import Firebase from 'firebase';
import fetch from 'isomorphic-unfetch';
import { GetServerSideProps, NextPage } from 'next';
import { parseCookies } from 'nookies';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFirebase } from 'react-redux-firebase';
import { RootState } from '../rootReducer';
import { setStatus } from './loginSlice';

const LoginPage: NextPage<{ token?: string }> = ({ token }) => {
  const { status, error } = useSelector((state: RootState) => state.login);
  const dispatch = useDispatch();
  const firebase = useFirebase();

  async function signIn(): Promise<void> {
    if (token) {
      try {
        const auth = firebase.auth();

        await auth.setPersistence(Firebase.auth.Auth.Persistence.NONE);

        const {
          user: { user },
        } = ((await firebase.login({
          token,
          profile: {},
        })) as unknown) as { user: Firebase.auth.UserCredential };

        if (!user) {
          throw new Error('Could not login through firebase!');
        }

        const idToken = await user.getIdToken();

        const { csrfToken } = parseCookies();
        await fetch('/api/session/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, csrfToken }),
        });

        await auth.signOut();

        window.location.replace('/');
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

export const getServerSideProps: GetServerSideProps = async ({
  query: { token },
}) =>
  Promise.resolve({
    props: {
      token: typeof token !== 'string' ? undefined : token,
    },
  });

export default LoginPage;
