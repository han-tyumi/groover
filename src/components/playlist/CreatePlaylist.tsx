import {
  createStyles,
  IconButton,
  makeStyles,
  Paper,
  TextField,
  Theme,
} from '@material-ui/core';
import { Create } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setName } from 'store/playlistSlice';
import { RootState } from 'store/rootReducer';
import { fetchJson } from './utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(1),
    },
    input: {
      flex: 1,
      marginRight: theme.spacing(1),
    },
  }),
);

const CreatePlaylist: React.FunctionComponent = () => {
  const classes = useStyles();
  const { name, tracks } = useSelector((state: RootState) => state.playlist);
  const dispatch = useDispatch();

  return (
    <Paper>
      <form
        className={classes.root}
        noValidate
        autoComplete="off"
        onSubmit={async (event): Promise<void> => {
          event.preventDefault();
          await fetchJson(`/api/create/${name}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(tracks),
          });
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
        <IconButton type="submit">
          <Create />
        </IconButton>
      </form>
    </Paper>
  );
};

export default CreatePlaylist;
