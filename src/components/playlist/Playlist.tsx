import { RemoveCircle } from '@material-ui/icons';
import {
  unwrapActionData,
  useActionExecutor,
  wrapTableData,
} from 'components/utils';
import firebase from 'firebase';
import MaterialTable, { Action } from 'material-table';
import { useSnackbar } from 'notistack';
import { createRef } from 'react';
import { useSelector } from 'react-redux';
import { useFirestore, useFirestoreConnect } from 'react-redux-firebase';
import { RootState } from 'store/rootReducer';
import { actionIcon, icons, trackColumns, TrackTableData } from './models';

/**
 * Represents a Spotify playlist.
 * Tracks are added through firestore and can be removed through this component.
 */
const Playlist: React.FunctionComponent<{ id: string }> = ({ id }) => {
  useFirestoreConnect({
    collection: 'playlist',
    doc: id,
  });
  const tracks = useSelector(
    (state: RootState) => state.firestore.data.playlist?.[id]?.tracks,
  );
  const firestore = useFirestore();
  const { enqueueSnackbar } = useSnackbar();
  const executor = useActionExecutor();

  const tableRef = createRef<MaterialTable<TrackTableData>>();

  const removeAction: Action<TrackTableData> = {
    tooltip: 'Remove',
    icon: actionIcon(RemoveCircle),
    onClick: (_event, data): void =>
      void executor('Removing', async () => {
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
      }),
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
