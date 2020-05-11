import { Grid } from '@material-ui/core';
import Play from 'components/playlist/Play';
import Playlist from 'components/playlist/Playlist';
import Search from 'components/playlist/Search';
import Title from 'components/Title';
import User from 'components/User';
import HttpStatus from 'http-status-codes';
import { GetServerSideProps, NextPage } from 'next';
import { basicConverter } from 'server/firebase';
import { firestore, getUser, verifySession } from 'server/firebase-admin';
import { PlaylistInfo, UserInfo } from 'server/models';
import { signIn } from 'server/spotify-api';

/**
 * Allows the user to edit their playlist.
 */
const EditPage: NextPage<{
  user: UserInfo;
  playlist: PlaylistInfo;
  devices: SpotifyApi.UserDevice[];
}> = ({ user, playlist, devices }) => {
  return (
    <Title>
      <Grid item xs={12}>
        <User user={user} />
      </Grid>
      <Grid item xs={12}>
        <Search id={playlist.id} />
      </Grid>
      <Grid item xs={12}>
        <Playlist id={playlist.id} />
      </Grid>
      <Play playlist={playlist} devices={devices} />
    </Title>
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

    const { uid } = await verifySession(req);

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

    if (playlist.uid !== uid) {
      throw new Error('Unauthorized access!');
    }

    const user = await getUser(uid);

    // fetch devices
    const spotifyApi = await signIn(uid);
    const devices = await (await spotifyApi.getMyDevices()).body.devices;

    return { props: { user, playlist, devices } };
  } catch (error) {
    res.writeHead(HttpStatus.MOVED_TEMPORARILY, { Location: '/' }).end();
    return { props: {} };
  }
};

export default EditPage;
