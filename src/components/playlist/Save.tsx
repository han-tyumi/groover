import {
  Button,
  CircularProgress,
  createStyles,
  Grid,
  makeStyles,
  Paper,
  TextField,
  Theme,
} from '@material-ui/core';
import fetch from 'isomorphic-unfetch';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useFirestore, useFirestoreConnect } from 'react-redux-firebase';
import { RootState } from 'store/rootReducer';
import { delay } from './utils';

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

const Save: React.FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  useFirestoreConnect({
    collection: 'playlist',
    doc: id,
  });
  /** @todo Double check types for playlist collection when undefined (might actually be null). */
  const playlist = useSelector(
    (state: RootState) => state.firestore.data.playlist?.[id],
  );
  const firestore = useFirestore();

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
                await fetch(`/api/create/${playlist?.name}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(playlist?.tracks),
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
              onChange={async ({ target: { value } }): Promise<void> => {
                await firestore.collection('playlist').doc(id).update({
                  name: value,
                });
              }}
            />
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={!playlist?.tracks}
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
    </>
  );
};

export default Save;
