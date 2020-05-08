import {
  Button,
  CircularProgress,
  createStyles,
  Grid,
  Link,
  makeStyles,
  Paper,
  TextField,
  Theme,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { PlaylistInfo } from 'pages/api/create/[name]';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setName, setUrl } from 'store/playlistSlice';
import { RootState } from 'store/rootReducer';
import { delay, fetchJson } from './utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(2, 3),
    },
    input: {
      flex: 1,
      marginRight: theme.spacing(2),
    },
  }),
);

const CreatePlaylist: React.FunctionComponent = () => {
  const classes = useStyles();
  const { name, tracks, url } = useSelector(
    (state: RootState) => state.playlist,
  );
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Grid item>
        <Paper>
          <form
            className={classes.root}
            noValidate
            autoComplete="off"
            onSubmit={async (event): Promise<void> => {
              event.preventDefault();
              const cancelAction = delay(() => setLoading(true), 800);
              try {
                const playlistInfo = await fetchJson<PlaylistInfo>(
                  `/api/create/${name}`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(tracks),
                  },
                );
                dispatch(setUrl(playlistInfo.url));
                enqueueSnackbar('Created Playlist', { variant: 'success' });
              } catch (error) {
                enqueueSnackbar(error.toString(), { variant: 'error' });
              }
              cancelAction();
              setLoading(false);
            }}
          >
            <TextField
              className={classes.input}
              variant="outlined"
              id="name"
              name="name"
              label="Playlist Name (Optional)"
              autoFocus
              value={name}
              onChange={({ target: { value } }): void =>
                void dispatch(setName(value))
              }
            />
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={!tracks.length}
            >
              {loading ? (
                <CircularProgress size={30} color="inherit" />
              ) : (
                'Create'
              )}
            </Button>
          </form>
        </Paper>
      </Grid>
      {url && (
        <Grid item>
          <Link href={`/playlist/${url}`}>{`/playlist/${url}`}</Link>
        </Grid>
      )}
    </>
  );
};

export default CreatePlaylist;
