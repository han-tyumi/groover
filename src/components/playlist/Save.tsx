import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  Paper,
  TextField,
  Theme,
} from '@material-ui/core';
import { useActionExecutor } from 'components/utils';
import fetch from 'isomorphic-unfetch';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { useFirestore, useFirestoreConnect } from 'react-redux-firebase';
import { RootState } from 'store/rootReducer';

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
  const executor = useActionExecutor();

  useFirestoreConnect({
    collection: 'playlist',
    doc: id,
  });
  const playlist = useSelector(
    (state: RootState) => state.firestore.data.playlist?.[id],
  );
  const firestore = useFirestore();

  return (
    <>
      <Grid item>
        <Paper>
          <form
            className={classes.root}
            noValidate
            autoComplete="off"
            onSubmit={(event): void =>
              void executor('Saving', async () => {
                event.preventDefault();
                await fetch(`/api/create/${playlist?.name}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(playlist?.tracks),
                });
                enqueueSnackbar('Created Playlist', { variant: 'success' });
              })
            }
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
              Create
            </Button>
          </form>
        </Paper>
      </Grid>
    </>
  );
};

export default Save;
