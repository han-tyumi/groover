import { AddBox } from '@material-ui/icons';
import firebase from 'firebase';
import MaterialTable, { Action, QueryResult } from 'material-table';
import { useSnackbar } from 'notistack';
import { createRef } from 'react';
import { useFirestore } from 'react-redux-firebase';
import { actionIcon, icons, trackColumns, TrackTableData } from './models';
import { delay, fetchJson, unwrapActionData, wrapTableData } from './utils';

/**
 * Used to search for tracks within Spotify.
 * Added tracks are added to the playlist firestore doc to be used by other components.
 */
const Search: React.FunctionComponent<{ id: string }> = ({ id }) => {
  const firestore = useFirestore();
  const { enqueueSnackbar } = useSnackbar();

  const tableRef = createRef<MaterialTable<TrackTableData>>();

  const addAction: Action<TrackTableData> = {
    tooltip: 'Add',
    icon: actionIcon(AddBox),
    onClick: async (_event, data): Promise<void> => {
      const cancelAction = delay(
        () =>
          enqueueSnackbar('Adding taking longer than expected...', {
            variant: 'info',
          }),
        1000,
      );

      try {
        // add tracks to firestore
        const added = unwrapActionData(data);
        await firestore
          .collection('playlist')
          .doc(id)
          .update({
            tracks: firebase.firestore.FieldValue.arrayUnion(...added),
          });

        // clear any selection
        tableRef.current?.onAllSelected(false);

        const amount = added.length;
        enqueueSnackbar(
          'Added ' + (amount > 1 ? `${amount} Tracks` : `${added[0].name}`),
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
      title="Search"
      icons={icons}
      options={{
        pageSize: 25,
        pageSizeOptions: [25, 50],
        searchFieldAlignment: 'left',
        selection: true,
        minBodyHeight: 500,
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
          // load user's saved tracks by default,
          // otherwise search Spotify's entire collection
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
