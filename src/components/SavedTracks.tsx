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
  Column,
  Icons,
  Options,
  Query,
  QueryResult,
} from 'material-table';
import { forwardRef } from 'react';

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
};

const columns: Column<SpotifyApi.TrackObjectFull>[] = [
  { title: 'Name', field: 'name' },
  { title: 'Artist', field: 'artists[0].name' },
  { title: 'Album', field: 'album.name' },
];

async function data({
  search,
  page,
  pageSize,
}: Query<SpotifyApi.TrackObjectFull>): Promise<
  QueryResult<SpotifyApi.TrackObjectFull>
> {
  if (search) {
    const tracks = (await (
      await fetch(`/api/search/${search}/${pageSize}/${page}`)
    ).json()) as SpotifyApi.PagingObject<SpotifyApi.TrackObjectFull>;
    return {
      data: tracks.items,
      page,
      totalCount: tracks.total,
    };
  }
  const tracks = (await (
    await fetch(`/api/tracks/${pageSize}/${page}`)
  ).json()) as SpotifyApi.UsersSavedTracksResponse;
  return {
    data: tracks.items.map((t) => t.track),
    page,
    totalCount: tracks.total,
  };
}

const SavedTracks: React.FunctionComponent = () => {
  return (
    <MaterialTable
      title="Tracks"
      icons={icons}
      options={options}
      columns={columns}
      data={data}
    />
  );
};

export default SavedTracks;
