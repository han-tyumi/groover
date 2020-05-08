import { AddBox } from '@material-ui/icons';
import MaterialTable, { Action, QueryResult } from 'material-table';
import { useSnackbar } from 'notistack';
import { createRef } from 'react';
import { useDispatch } from 'react-redux';
import { addTracks } from 'store/playlistSlice';
import { actionIcon, icons, trackColumns, TrackTableData } from './models';
import { fetchJson, unwrapActionData, wrapTableData } from './utils';

/**
 * Used to search for tracks within Spotify.
 * Added tracks are added to the store to be used by other components.
 */
const Search: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const tableRef = createRef<MaterialTable<TrackTableData>>();
  const { enqueueSnackbar } = useSnackbar();

  const addAction: Action<TrackTableData> = {
    tooltip: 'Add',
    icon: actionIcon(AddBox),
    onClick: (_event, data): void => {
      const added = unwrapActionData(data);
      dispatch(addTracks(added));

      tableRef.current?.onAllSelected(false);

      const amount = added.length;
      enqueueSnackbar(
        'Added ' + (amount > 1 ? `${amount} Tracks` : `${added[0].name}`),
        {
          variant: 'info',
        },
      );
    },
  };

  return (
    <MaterialTable
      title="Search"
      icons={icons}
      options={{
        pageSize: 25,
        pageSizeOptions: [25, 50],
        searchFieldAlignment: 'left',
        selection: true,
        maxBodyHeight: 500,
        draggable: false,
        debounceInterval: 1000,
      }}
      columns={trackColumns}
      data={async ({
        search,
        page,
        pageSize,
      }): Promise<QueryResult<TrackTableData>> => {
        try {
          let pager:
            | SpotifyApi.PagingObject<SpotifyApi.TrackObjectFull>
            | SpotifyApi.UsersSavedTracksResponse;
          let data: TrackTableData[];
          if (search) {
            pager = await fetchJson<
              SpotifyApi.PagingObject<SpotifyApi.TrackObjectFull>
            >(`/api/search/${search}/${pageSize}/${page}`);
            data = wrapTableData(pager.items);
          } else {
            pager = await fetchJson<SpotifyApi.UsersSavedTracksResponse>(
              `/api/tracks/${pageSize}/${page}`,
            );
            data = pager.items.map((i) => ({ data: i.track }));
          }

          return {
            data,
            page,
            totalCount: pager.total,
          };
        } catch {
          return {
            data: [],
            page: 0,
            totalCount: 0,
          };
        }
      }}
      tableRef={tableRef}
      actions={[
        {
          position: 'row',
          ...addAction,
        },
        {
          position: 'toolbarOnSelect',
          ...addAction,
        },
      ]}
    />
  );
};

export default Search;
