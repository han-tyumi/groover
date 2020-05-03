import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { GetServerSideProps, NextPage } from 'next';
import Login from '../components/Login';
import Playlist from '../components/Playlist';
import User from '../components/User';
import { getUser, verifySession } from '../server/firebase-admin';
import { UserInfo } from '../server/models';
import { signIn } from '../server/spotify-api';

const useStyles = makeStyles((theme) =>
  createStyles({
    subtitle: {
      marginTop: -theme.spacing(2),
      marginLeft: theme.spacing(4),
    },
  }),
);

const IndexPage: NextPage<{
  user?: UserInfo;
  tracks?: SpotifyApi.SavedTrackObject[];
}> = ({ user, tracks }) => {
  const classes = useStyles();

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item>
        <Typography variant="h1" color="primary">
          <b>Groover</b>
        </Typography>
        <Typography
          className={classes.subtitle}
          variant="subtitle1"
          color="secondary"
        >
          Collaborate and listen
        </Typography>
      </Grid>
      <Grid item>{user ? <User user={user} /> : <Login />}</Grid>
      {tracks && (
        <Grid item>
          <Playlist tracks={tracks} />
        </Grid>
      )}
      {user && (
        <Grid item>
          <Button variant="outlined" size="small" href="/api/session/logout">
            Logout
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    const { uid } = await verifySession(req);
    const user = await getUser(uid);
    const spotifyApi = await signIn(uid);
    const tracks = (await spotifyApi.getMySavedTracks()).body.items;
    return { props: { user, tracks } };
  } catch (error) {
    return { props: {} };
  }
};

export default IndexPage;
