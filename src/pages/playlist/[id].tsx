import { createStyles, Grid, makeStyles, Typography } from '@material-ui/core';
import Play from 'components/playlist/Play';
import Playlist from 'components/playlist/Playlist';
import User from 'components/User';
import HttpStatus from 'http-status-codes';
import { GetServerSideProps, NextPage } from 'next';
import { basicConverter } from 'server/firebase';
import { firestore, getUser } from 'server/firebase-admin';
import { PlaylistInfo, UserInfo } from 'server/models';
import { signIn } from 'server/spotify-api';

const useStyles = makeStyles((theme) =>
  createStyles({
    subtitle: {
      marginTop: -theme.spacing(2),
      marginLeft: theme.spacing(4),
    },
  }),
);

const PlaylistPage: NextPage<{
  user: UserInfo;
  playlist: PlaylistInfo;
  devices: SpotifyApi.UserDevice[];
}> = ({ user, playlist, devices }) => {
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
      <Grid item>
        <User user={user} />
      </Grid>
      <Grid item>
        <Playlist id={playlist.id} />
      </Grid>
      <Play playlist={playlist} devices={devices} />
    </Grid>
  );
};

export const getServerSideProps: GetServerSideProps<
  {
    user?: UserInfo;
    playlist?: PlaylistInfo;
    devices?: SpotifyApi.UserDevice[];
  },
  { id: string }
> = async ({ req, res, params }) => {
  try {
    const id = params?.id;
    if (!id) {
      throw new Error('Missing ID!');
    }

    // fetch playlist
    const playlist = await (
      await firestore
        .collection('playlist')
        .doc(id)
        .withConverter(basicConverter<PlaylistInfo>())
        .get()
    ).data();
    if (!playlist) {
      throw new Error("Playlist doesn't exist!");
    }

    const user = await getUser(playlist.uid);

    // fetch devices
    const spotifyApi = await signIn(req);
    const devices = await (await spotifyApi.getMyDevices()).body.devices;

    return { props: { user, playlist, devices } };
  } catch (error) {
    res.writeHead(HttpStatus.MOVED_TEMPORARILY, { Location: '/' }).end();
    return { props: {} };
  }
};

export default PlaylistPage;
