import { Button, Grid, TextField } from '@material-ui/core';
import Play from 'components/playlist/Play';
import Playlist from 'components/playlist/Playlist';
import Search from 'components/playlist/Search';
import Title from 'components/Title';
import User from 'components/User';
import { useActionExecutor } from 'components/utils';
import HttpStatus from 'http-status-codes';
import { PlaylistInfo, UserInfo } from 'models';
import { GetServerSideProps, NextPage } from 'next';
import { useEffect, useRef, useState } from 'react';
import { firestore, getUser, verifySession } from 'server/firebase-admin';
import { signIn } from 'server/spotify-api';
import { basicConverter } from 'utils';

/**
 * Allows the user to edit their playlist.
 */
const EditPage: NextPage<{
  user: UserInfo;
  playlist: PlaylistInfo;
  accessToken: string;
}> = ({ user, playlist, accessToken }) => {
  const executor = useActionExecutor();
  const [link, setLink] = useState<string>();
  const textField = useRef<HTMLInputElement>();

  useEffect(() => {
    setLink(`${location.protocol}//${location.host}/playlist/${playlist.id}`);
  }, []);

  return (
    <Title>
      <Grid item xs={12}>
        <User user={user} />
      </Grid>
      {link && (
        <>
          <Grid item xs={10}>
            <TextField
              inputRef={textField}
              label="Sharable Link"
              defaultValue={link}
              InputProps={{ readOnly: true }}
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={(): void => {
                textField.current?.focus();
                textField.current?.select();
                executor({
                  verb: 'Copying',
                  action: () => {
                    document.execCommand('copy');
                    return 'Copied';
                  },
                  variant: 'info',
                });
              }}
            >
              Copy Link
            </Button>
          </Grid>
        </>
      )}
      <Grid item xs={12} lg={6}>
        <Search id={playlist.id} />
      </Grid>
      <Grid item xs={12} lg={6}>
        <Playlist id={playlist.id} />
      </Grid>
      <Play playlist={playlist} accessToken={accessToken} />
    </Title>
  );
};

export const getServerSideProps: GetServerSideProps<
  {
    user?: UserInfo;
    playlist?: PlaylistInfo;
    accessToken?: string;
  },
  { id: string }
> = async ({ req, res, params }) => {
  try {
    const id = params?.id;
    if (!id) {
      throw new Error('Missing ID!');
    }

    const { uid } = await verifySession(req);
    const spotifyApi = await signIn(uid);

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

    return {
      props: { user, playlist, accessToken: spotifyApi.getAccessToken() },
    };
  } catch (error) {
    res.writeHead(HttpStatus.MOVED_TEMPORARILY, { Location: '/' }).end();
    return { props: {} };
  }
};

export default EditPage;
