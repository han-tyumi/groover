import { Column } from 'material-table';
import { TableDataWrapper } from '../utils';

export type TrackTableData = TableDataWrapper<SpotifyApi.TrackObjectFull>;

export const trackColumns: Column<TrackTableData>[] = [
  { title: 'Name', field: 'data.name' },
  {
    title: 'Artist',
    render: (data): string => data.data.artists.map((a) => a.name).join(', '),
  },
  { title: 'Album', field: 'data.album.name' },
];
