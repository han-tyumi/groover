import { Grid, SvgIconProps } from '@material-ui/core';
import {
  AddBox,
  ArrowDownward,
  Check,
  ChevronLeft,
  ChevronRight,
  Clear,
  DeleteOutline,
  Edit,
  FilterList,
  FirstPage,
  LastPage,
  Remove,
  SaveAlt,
  Search,
  ViewColumn,
} from '@material-ui/icons';
import fetch from 'isomorphic-unfetch';
import MaterialTable, {
  Action,
  Column,
  Icons,
  Options,
  Query,
  QueryResult,
} from 'material-table';
import { forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTracks } from '../store/playlistSlice';
import { RootState } from '../store/rootReducer';

type TableData = { data: SpotifyApi.TrackObjectFull };

const icons: Icons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const PAGE_SIZES = [25, 50];

const options: Options = {
  pageSizeOptions: PAGE_SIZES,
  pageSize: PAGE_SIZES[0],
  searchFieldAlignment: 'left',
  selection: true,
  maxBodyHeight: 500,
  draggable: false,
};

const columns: Column<TableData>[] = [
  { title: 'Name', field: 'data.name' },
  {
    title: 'Artist',
    render: (data): string => data.data.artists.map((a) => a.name).join(', '),
  },
  { title: 'Album', field: 'data.album.name' },
];

async function data({
  search,
  page,
  pageSize,
}: Query<TableData>): Promise<QueryResult<TableData>> {
  try {
    if (search) {
      const pager = (await (
        await fetch(`/api/search/${search}/${pageSize}/${page}`)
      ).json()) as SpotifyApi.PagingObject<SpotifyApi.TrackObjectFull>;
      return {
        data: pager.items.map((i) => ({ data: i })),
        page,
        totalCount: pager.total,
      };
    }
    const pager = (await (
      await fetch(`/api/tracks/${pageSize}/${page}`)
    ).json()) as SpotifyApi.UsersSavedTracksResponse;
    return {
      data: pager.items.map((t) => ({ data: t.track })),
      page,
      totalCount: pager.total,
    };
  } catch (error) {
    return {
      data: [],
      page: 0,
      totalCount: 0,
    };
  }
}

const EditPlaylist: React.FunctionComponent = () => {
  const { playlist } = useSelector((state: RootState) => state.playlist);
  const dispatch = useDispatch();

  const actions: Action<TableData>[] = [
    {
      tooltip: 'Add Tracks',
      icon: (): React.ReactElement<SvgIconProps> =>
        (<AddBox />) as React.ReactElement<SvgIconProps>,
      onClick: (_event, data): void => {
        const tracks = (data instanceof Array ? data : [data]).map(
          (t) => t.data,
        );
        dispatch(addTracks(tracks));
      },
    },
  ];

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item>
        <MaterialTable
          title="Tracks"
          icons={icons}
          options={options}
          columns={columns}
          data={data}
          actions={actions}
        />
      </Grid>
      <Grid item>
        <MaterialTable
          title="Playlist"
          icons={icons}
          options={{
            draggable: false,
          }}
          columns={columns}
          data={playlist.map((t) => ({ data: t }))}
        />
      </Grid>
    </Grid>
  );
};

export default EditPlaylist;
