import { createStyles, Grid, makeStyles, Typography } from '@material-ui/core';
import Playlist from 'components/playlist/Playlist';
import User from 'components/User';
import HttpStatus from 'http-status-codes';
import { GetServerSideProps, NextPage } from 'next';
import { PlaylistInfo } from 'pages/api/create/[name]';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { basicConverter } from 'server/firebase';
import { firestore, getUser } from 'server/firebase-admin';
import { UserInfo } from 'server/models';
import { signIn } from 'server/spotify-api';
import { setTracks } from 'store/playlistSlice';

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
  playlist: SpotifyApi.SinglePlaylistResponse;
}> = ({ user, playlist }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setTracks(playlist.tracks.items.map((i) => i.track)));
  }, []);

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
        <Playlist />
      </Grid>
    </Grid>
  );
};

export const getServerSideProps: GetServerSideProps<
  { user?: UserInfo; playlist?: SpotifyApi.SinglePlaylistResponse },
  { url: string }
> = async ({ req, res, params }) => {
  try {
    if (!params?.url) {
      throw new Error('Missing URL!');
    }

    const playlistInfo = await (
      await firestore
        .collection('playlist')
        .doc(params.url)
        .withConverter(basicConverter<PlaylistInfo>())
        .get()
    ).data();
    if (!playlistInfo) {
      throw new Error("Playlist doesn't exist!");
    }

    const spotifyApi = await signIn(req);
    const playlist = await (await spotifyApi.getPlaylist(playlistInfo.id)).body;

    const user = await getUser(playlistInfo.uid);

    return { props: { user, playlist } };
  } catch (error) {
    res.writeHead(HttpStatus.MOVED_TEMPORARILY, { Location: '/' }).end();
    return { props: {} };
  }
};

export default PlaylistPage;
