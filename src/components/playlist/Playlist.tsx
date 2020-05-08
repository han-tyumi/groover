import { RemoveCircle } from '@material-ui/icons';
import MaterialTable, { Action } from 'material-table';
import { useSnackbar } from 'notistack';
import { createRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeTracks } from 'store/playlistSlice';
import { RootState } from 'store/rootReducer';
import { actionIcon, icons, trackColumns, TrackTableData } from './models';
import { unwrapActionData, wrapTableData } from './utils';

/**
 * Represents a Spotify playlist.
 * Tracks are added through the store and can be removed through this component.
 */
const Playlist: React.FunctionComponent = () => {
  const { tracks } = useSelector((state: RootState) => state.playlist);
  const dispatch = useDispatch();
  const tableRef = createRef<MaterialTable<TrackTableData>>();
  const { enqueueSnackbar } = useSnackbar();

  const removeAction: Action<TrackTableData> = {
    tooltip: 'Remove',
    icon: actionIcon(RemoveCircle),
    onClick: (_event, data): void => {
      const removed = unwrapActionData(data);
      dispatch(removeTracks(removed));

      const amount = removed.length;
      enqueueSnackbar(
        'Removed ' + (amount > 1 ? `${amount} Tracks` : `${removed[0].name}`),
        {
          variant: 'info',
        },
      );
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
        maxBodyHeight: 500,
      }}
      columns={trackColumns}
      data={wrapTableData(tracks)}
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
