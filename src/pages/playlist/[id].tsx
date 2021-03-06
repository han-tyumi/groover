import { Grid } from '@material-ui/core';
import Playlist from 'components/playlist/Playlist';
import Search from 'components/playlist/Search';
import Title from 'components/Title';
import User from 'components/User';
import HttpStatus from 'http-status-codes';
import { PlaylistInfo, UserInfo } from 'models';
import { GetServerSideProps, NextPage } from 'next';
import { firestore, getUser } from 'server/firebase-admin';
import { signIn } from 'server/spotify-api';
import { basicConverter } from 'utils';

const PlaylistPage: NextPage<{
  user: UserInfo;
  playlist: PlaylistInfo;
}> = ({ user, playlist }) => {
  return (
    <Title>
      <Grid item xs={12}>
        <User user={user} />
      </Grid>
      <Grid item xs={12} lg={6}>
        <Search id={playlist.id} />
      </Grid>
      <Grid item xs={12} lg={6}>
        <Playlist id={playlist.id} readonly />
      </Grid>
    </Title>
  );
};

export const getServerSideProps: GetServerSideProps<
  {
    user?: UserInfo;
    playlist?: PlaylistInfo;
  },
  { id: string }
> = async ({ req, res, params }) => {
  try {
    const id = params?.id;
    if (!id) {
      throw new Error('Missing ID!');
    }

    await signIn(req);

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

    return { props: { user, playlist } };
  } catch (error) {
    res.writeHead(HttpStatus.MOVED_TEMPORARILY, { Location: '/' }).end();
    return { props: {} };
  }
};

export default PlaylistPage;
