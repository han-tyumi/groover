import { List, ListItem, ListItemText } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useFirestoreConnect } from 'react-redux-firebase';
import { RootState } from 'store/rootReducer';

/**
 * Presents a user's created playlists.
 */
const Playlists: React.FunctionComponent<{ uid: string }> = ({ uid }) => {
  useFirestoreConnect({
    collection: 'playlist',
    where: ['uid', '==', uid],
  });
  const playlists = useSelector(
    (state: RootState) => state.firestore.data.playlist,
  );

  if (!playlists) {
    return <></>;
  }

  return (
    <List>
      {Object.values(playlists).map(
        (p) =>
          p && (
            <ListItem key={p.id} button component="a" href={`/edit/${p.id}`}>
              <ListItemText primary={p.name || p.id} />
            </ListItem>
          ),
      )}
    </List>
  );
};

export default Playlists;
