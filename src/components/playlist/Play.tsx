import { Button, Grid, MenuItem, Select } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { PlaylistInfo } from 'server/models';
import { delay, fetchJson } from './utils';

/**
 * Allows the user to start playback for a given playlist.
 */
const Play: React.FunctionComponent<{
  playlist: PlaylistInfo;
  devices: SpotifyApi.UserDevice[];
}> = ({ playlist, devices }) => {
  const [device, setDevice] = useState(devices[0]?.id || undefined);
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <Grid item xs={10}>
        <Select
          fullWidth
          displayEmpty
          variant="outlined"
          value={device}
          onChange={(event): void =>
            void setDevice(event.target.value as string | undefined)
          }
        >
          <MenuItem key={undefined} value={undefined} disabled>
            Select a device...
          </MenuItem>
          {devices.map((d) => (
            <MenuItem key={d.id || undefined} value={d.id || undefined}>
              {d.name} - {d.type}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid item xs={2}>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          disabled={!device}
          onClick={async (): Promise<void> => {
            const cancelAction = delay(
              () =>
                enqueueSnackbar('Playing taking longer than expected...', {
                  variant: 'info',
                  persist: true,
                }),
              1000,
            );
            try {
              await fetchJson<{ success: boolean }>(
                `/api/playlist/${playlist.id}/play`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ device }),
                },
              );
              enqueueSnackbar('Playback Started', { variant: 'info' });
            } catch (error) {
              enqueueSnackbar(error.toString(), { variant: 'error' });
            }
            cancelAction();
          }}
        >
          Play
        </Button>
      </Grid>
    </>
  );
};

export default Play;
