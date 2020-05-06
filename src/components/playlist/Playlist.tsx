import { RemoveCircle } from '@material-ui/icons';
import MaterialTable, { Action } from 'material-table';
import { createRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeTracks } from '../../store/playlistSlice';
import { RootState } from '../../store/rootReducer';
import { actionIcon, icons, trackColumns, TrackTableData } from './models';
import { unwrapActionData, wrapTableData } from './utils';

const Playlist: React.FunctionComponent = () => {
  const { playlist } = useSelector((state: RootState) => state.playlist);
  const dispatch = useDispatch();
  const tableRef = createRef<MaterialTable<TrackTableData>>();

  const removeAction: Action<TrackTableData> = {
    tooltip: 'Remove',
    icon: actionIcon(RemoveCircle),
    onClick: (_event, data): void => {
      dispatch(removeTracks(unwrapActionData(data)));
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
      }}
      columns={trackColumns}
      data={wrapTableData(playlist)}
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
