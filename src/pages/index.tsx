import { Button, Grid } from '@material-ui/core';
import Login from 'components/Login';
import Playlists from 'components/playlist/Playlists';
import Title from 'components/Title';
import User from 'components/User';
import { fetchJson } from 'components/utils';
import { PlaylistInfo, UserInfo } from 'models';
import { GetServerSideProps, NextPage } from 'next';
import { getUser, verifySession } from 'server/firebase-admin';

const IndexPage: NextPage<{
  user?: UserInfo;
}> = ({ user }) => {
  return (
    <Title>
      <Grid item xs={12}>
        {user ? <User user={user} /> : <Login />}
      </Grid>
      {user && (
        <>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              onClick={async (): Promise<void> => {
                const id = (await fetchJson<PlaylistInfo>('/api/create')).id;
                window.location.assign(`/edit/${id}`);
              }}
            >
              Create
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Playlists uid={user.uid} />
          </Grid>
        </>
      )}
    </Title>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    const { uid } = await verifySession(req);
    const user = await getUser(uid);
    return { props: { user } };
  } catch (error) {
    return { props: {} };
  }
};

export default IndexPage;
