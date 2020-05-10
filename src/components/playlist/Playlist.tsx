import { RemoveCircle } from '@material-ui/icons';
import firebase from 'firebase';
import MaterialTable, { Action } from 'material-table';
import { useSnackbar } from 'notistack';
import { createRef } from 'react';
import { useSelector } from 'react-redux';
import { useFirestore, useFirestoreConnect } from 'react-redux-firebase';
import { RootState } from 'store/rootReducer';
import { actionIcon, icons, trackColumns, TrackTableData } from './models';
import { delay, unwrapActionData, wrapTableData } from './utils';

/**
 * Represents a Spotify playlist.
 * Tracks are added through firestore and can be removed through this component.
 */
const Playlist: React.FunctionComponent<{ id: string }> = ({ id }) => {
  useFirestoreConnect({
    collection: 'playlist',
    doc: id,
  });
  /** @todo Double check types for playlist collection when undefined (might actually be null). */
  const tracks = useSelector(
    (state: RootState) => state.firestore.data.playlist?.[id]?.tracks,
  ) as SpotifyApi.TrackObjectFull[] | undefined;
  const firestore = useFirestore();
  const { enqueueSnackbar } = useSnackbar();

  const tableRef = createRef<MaterialTable<TrackTableData>>();

  const removeAction: Action<TrackTableData> = {
    tooltip: 'Remove',
    icon: actionIcon(RemoveCircle),
    onClick: async (_event, data): Promise<void> => {
      /** @todo Try refactoring this pattern. */
      const cancelAction = delay(
        () =>
          enqueueSnackbar('Removing taking longer than expected...', {
            variant: 'info',
          }),
        1000,
      );

      try {
        // remove selected tracks from firestore
        const removed = unwrapActionData(data);
        await firestore
          .collection('playlist')
          .doc(id)
          .update({
            tracks: firebase.firestore.FieldValue.arrayRemove(...removed),
          });

        const amount = removed.length;
        enqueueSnackbar(
          'Removed ' + (amount > 1 ? `${amount} Tracks` : `${removed[0].name}`),
          {
            variant: 'info',
          },
        );
      } catch (error) {
        enqueueSnackbar(error.toString(), { variant: 'error' });
      }

      cancelAction();
    },
  };

  return (
    <MaterialTable
      title="Playlist"
      icons={icons}
      options={{
        draggable: false,
        selection: true,
        searchFieldAlignment: 'left',
        minBodyHeight: 500,
        maxBodyHeight: 500,
        paging: false,
      }}
      columns={trackColumns}
      data={wrapTableData(tracks || [])}
      tableRef={tableRef}
      actions={[
        {
          position: 'row',
          ...removeAction,
        },
        {
          position: 'toolbarOnSelect',
          ...removeAction,
        },
      ]}
    />
  );
};

export default Playlist;
