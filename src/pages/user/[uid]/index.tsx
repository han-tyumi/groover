import { Grid } from '@material-ui/core';
import fetch from 'isomorphic-unfetch';
import { GetServerSideProps, NextPage } from 'next';
import { useSelector } from 'react-redux';
import Login from '../../../components/Login';
import User from '../../../components/User';
import { RootState } from '../../../rootReducer';

const UserPage: NextPage<{
  tracks: SpotifyApi.SavedTrackObject[];
}> = ({ tracks }) => {
  const auth = useSelector((state: RootState) => state.firebase.auth);

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item>
        {auth.isEmpty ? <Login /> : <User user={auth} tracks={tracks} />}
      </Grid>
    </Grid>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const uid = context.query.uid;
  const res = await fetch(
    new URL(`/api/user/${uid}/tracks`, process.env.BASE_URL).href,
  );
  const tracks = await res.json();
  return { props: { tracks } };
};

export default UserPage;
