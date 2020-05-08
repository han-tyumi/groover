import {
  Button,
  CircularProgress,
  createStyles,
  makeStyles,
  Paper,
  TextField,
  Theme,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setName } from 'store/playlistSlice';
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
  const { name, tracks } = useSelector((state: RootState) => state.playlist);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  return (
    <Paper>
      <form
        className={classes.root}
        noValidate
        autoComplete="off"
        onSubmit={async (event): Promise<void> => {
          event.preventDefault();
          const cancelAction = delay(() => setLoading(true), 800);
          try {
            await fetchJson(`/api/create/${name}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(tracks),
            });
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
          {loading ? <CircularProgress size={30} color="inherit" /> : 'Create'}
        </Button>
      </form>
    </Paper>
  );
};

export default CreatePlaylist;
