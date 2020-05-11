import { TableDataWrapper } from 'components/utils';
import { Column } from 'material-table';

/** Data to be used by material-tables displaying Spotify track information. */
export type TrackTableData = TableDataWrapper<SpotifyApi.TrackObjectFull>;

/** Columns used to display Spotify track information in a material-table. */
export const trackColumns: Column<TrackTableData>[] = [
  { title: 'Name', field: 'data.name' },
  {
    title: 'Artist',
    render: (data): string => data.data.artists.map((a) => a.name).join(', '),
  },
  { title: 'Album', field: 'data.album.name' },
];
